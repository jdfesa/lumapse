#!/usr/bin/env python3
"""Validate and summarize manually captured F3 CSV evidence; never capture it.

CRUD: 30 valid measured samples per profile/operation; warm-ups excluded. Median is
the middle pair's average, p95 is nearest rank ceil(.95*n), and every valid
total_ms > 200 fails. total_ms is NEVER derived from persistence + refresh.
FPS: three f3-500 runs, each with ten valid 950..1050 ms segments; FPS is
frames_completos / (duracion_ms / 1000). Supplied FPS may differ by at most
0.05 (rounding). Every valid segment < 55 fails its run. Absent/incomplete
evidence is PENDING, not zero or PASS. Numeric/CSV/JSON integrity errors exit 2.
"""

import argparse
import csv
import json
import math
import re
import sys
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from pathlib import Path


CRUD_HEADERS = "sesion,perfil,operacion,intento,calentamiento,valida,motivo,notas_visibles_antes,notas_visibles_despues,total_ms,persistencia_ms,refresco_ms,traza_sha256,inicio_traza_ms,fin_traza_ms,resultado_funcional".split(",")
FRAMES_HEADERS = "sesion,perfil,recorrido,tramo,inicio_traza_ms,duracion_ms,frames_completos,frames_parciales,frames_perdidos,fps,valida,motivo,traza_sha256,fuente_eventos".split(",")
PROFILES = ("f3-small", "f3-500")
OPERATIONS = ("crear", "editar", "papelera")
RUNS = ("1", "2", "3")
SHA = re.compile(r"[0-9a-fA-F]{64}\Z")
FPS_TOLERANCE = Decimal("0.05")


class EvidenceError(ValueError):
    pass


def number(value, field, where, *, required=False, integer=False, positive=False):
    if value == "" or value is None:
        if required:
            raise EvidenceError(f"{where}: missing {field}")
        return None
    try:
        result = Decimal(value)
    except (InvalidOperation, ValueError):
        raise EvidenceError(f"{where}: invalid {field}: {value!r}") from None
    if not result.is_finite() or result < 0 or (positive and result == 0):
        raise EvidenceError(f"{where}: invalid {field}: {value!r}")
    try:
        if not math.isfinite(float(result)):
            raise EvidenceError(f"{where}: invalid {field}: out of numeric range")
    except OverflowError:
        raise EvidenceError(f"{where}: invalid {field}: out of numeric range") from None
    if integer and result != result.to_integral_value():
        raise EvidenceError(f"{where}: invalid integer {field}: {value!r}")
    return int(result) if integer else result


def boolean(value, field, where):
    if value not in ("true", "false"):
        raise EvidenceError(f"{where}: invalid {field}: expected true or false")
    return value == "true"


def check_sha(value, field, where):
    if value is not None and value != "" and (not isinstance(value, str) or not SHA.fullmatch(value)):
        raise EvidenceError(f"{where}: invalid {field}: expected 64 hexadecimal characters")


def read_csv(path, headers):
    try:
        with Path(path).open(newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle, strict=True)
            if reader.fieldnames != headers:
                raise EvidenceError(f"{path}: wrong required headers (expected exact template order)")
            rows = []
            for line, row in enumerate(reader, 2):
                if None in row or any(value is None for value in row.values()):
                    raise EvidenceError(f"{path}:{line}: malformed CSV row")
                rows.append({key: value.strip() for key, value in row.items()})
            return rows
    except (OSError, UnicodeError, csv.Error) as error:
        raise EvidenceError(f"{path}: malformed/unreadable CSV: {error}") from error


def validate_crud(path):
    rows = read_csv(path, CRUD_HEADERS)
    seen = set()
    sessions = set()
    groups = defaultdict(list)
    for line, row in enumerate(rows, 2):
        where = f"{path}:{line}"
        profile, operation, session = row["perfil"], row["operacion"], row["sesion"]
        if not session or profile not in PROFILES or operation not in OPERATIONS:
            raise EvidenceError(f"{where}: invalid sesion/perfil/operacion")
        attempt = number(row["intento"], "intento", where, required=True, integer=True, positive=True)
        warmup = boolean(row["calentamiento"], "calentamiento", where)
        identity = (session, profile, operation, warmup, attempt)
        if identity in seen:
            raise EvidenceError(f"{where}: duplicate CRUD sample identity {identity}")
        seen.add(identity)
        sessions.add(session)
        valid = boolean(row["valida"], "valida", where)
        if not valid and not row["motivo"]:
            raise EvidenceError(f"{where}: invalid row requires motivo")
        fields = {}
        for field in ("notas_visibles_antes", "notas_visibles_despues"):
            fields[field] = number(row[field], field, where, integer=True)
        for field in ("total_ms", "persistencia_ms", "refresco_ms", "inicio_traza_ms", "fin_traza_ms"):
            fields[field] = number(row[field], field, where)
        if valid and not warmup and fields["total_ms"] is None:
            raise EvidenceError(f"{where}: valid measured sample requires total_ms")
        if fields["inicio_traza_ms"] is not None and fields["fin_traza_ms"] is not None:
            if fields["fin_traza_ms"] < fields["inicio_traza_ms"]:
                raise EvidenceError(f"{where}: fin_traza_ms precedes inicio_traza_ms")
        check_sha(row["traza_sha256"], "traza_sha256", where)
        functional = row["resultado_funcional"].lower()
        if functional not in ("", "ok", "fallo", "pendiente"):
            raise EvidenceError(f"{where}: resultado_funcional must be ok, fallo, pendiente or blank")
        groups[(profile, operation)].append(dict(warmup=warmup, valid=valid, fields=fields,
                                                 functional=functional, trace=bool(row["traza_sha256"]),
                                                 offsets=fields["inicio_traza_ms"] is not None and fields["fin_traza_ms"] is not None))
    if len(sessions) > 1:
        raise EvidenceError(f"{path}: multiple sesion identities cannot be aggregated")
    result = []
    for profile in PROFILES:
        for operation in OPERATIONS:
            items = groups[(profile, operation)]
            measured = [item for item in items if not item["warmup"]]
            valid = [item for item in measured if item["valid"]]
            totals = sorted(item["fields"]["total_ms"] for item in valid)
            functional = {
                "ok": sum(item["functional"] == "ok" for item in valid),
                "failed": sum(item["functional"] == "fallo" for item in measured),
                "missing": sum(item["functional"] in ("", "pendiente") for item in valid),
            }
            over = sum(value > 200 for value in totals)
            status = "FAIL" if over or functional["failed"] else "PENDING"
            if status != "FAIL" and len(valid) >= 30 and not functional["missing"] and all(item["trace"] and item["offsets"] for item in valid):
                status = "PASS"
            n = len(totals)
            result.append({
                "profile": profile, "operation": operation, "status": status,
                "attempts": len(items), "valid": len(valid),
                "invalid": len(measured) - len(valid), "warmups": len(items) - len(measured),
                "functional": functional, "missing_trace_sha256": sum(not item["trace"] for item in valid),
                "missing_trace_offsets": sum(not item["offsets"] for item in valid),
                "median_ms": float((totals[(n - 1) // 2] + totals[n // 2]) / 2) if n else None,
                "p95_ms": float(totals[math.ceil(Decimal("0.95") * n) - 1]) if n else None,
                "max_ms": float(totals[-1]) if n else None,
                "over_200_ms": over,
                "persistencia_ms": decomposition(valid, "persistencia_ms"),
                "refresco_ms": decomposition(valid, "refresco_ms"),
            })
    return {"groups": result, "total_attempts": len(rows), "session_id": next(iter(sessions), None)}


def decomposition(valid, field):
    values = [item["fields"][field] for item in valid if item["fields"][field] is not None]
    return {"present": len(values), "missing": len(valid) - len(values),
            "median_ms": float(median(sorted(values))) if values else None}


def median(sorted_values):
    n = len(sorted_values)
    return (sorted_values[(n - 1) // 2] + sorted_values[n // 2]) / 2


def validate_frames(path):
    rows = read_csv(path, FRAMES_HEADERS)
    seen = set()
    sessions = set()
    groups = defaultdict(list)
    for line, row in enumerate(rows, 2):
        where = f"{path}:{line}"
        session, profile, run = row["sesion"], row["perfil"], row["recorrido"]
        if not session or profile != "f3-500" or run not in RUNS:
            raise EvidenceError(f"{where}: invalid sesion/perfil/recorrido; expected f3-500 and 1..3")
        segment = number(row["tramo"], "tramo", where, required=True, integer=True, positive=True)
        if segment > 10:
            raise EvidenceError(f"{where}: tramo must be 1..10")
        identity = (session, profile, run, segment)
        if identity in seen:
            raise EvidenceError(f"{where}: duplicate FPS segment identity {identity}")
        seen.add(identity)
        sessions.add(session)
        valid = boolean(row["valida"], "valida", where)
        if not valid and not row["motivo"]:
            raise EvidenceError(f"{where}: invalid row requires motivo")
        start = number(row["inicio_traza_ms"], "inicio_traza_ms", where)
        duration = number(row["duracion_ms"], "duracion_ms", where, positive=True)
        completed = number(row["frames_completos"], "frames_completos", where, integer=True)
        for field in ("frames_parciales", "frames_perdidos"):
            number(row[field], field, where, required=valid, integer=True)
        supplied = number(row["fps"], "fps", where)
        if valid and (start is None or duration is None or completed is None or not row["fuente_eventos"]):
            raise EvidenceError(f"{where}: valid segment requires start, duration, frame counts and fuente_eventos")
        if valid and not Decimal("950") <= duration <= Decimal("1050"):
            raise EvidenceError(f"{where}: valid tramo must be one second (950..1050 ms)")
        if supplied is not None and (duration is None or completed is None):
            raise EvidenceError(f"{where}: supplied fps requires duration and completed frames")
        fps = Decimal(completed) * 1000 / duration if duration is not None and completed is not None else None
        if supplied is not None and abs(supplied - fps) > FPS_TOLERANCE:
            raise EvidenceError(f"{where}: supplied fps differs from recomputed fps by more than 0.05")
        check_sha(row["traza_sha256"], "traza_sha256", where)
        groups[run].append({"valid": valid, "fps": fps, "trace": bool(row["traza_sha256"]),
                            "source": bool(row["fuente_eventos"]), "segment": segment})
    if len(sessions) > 1:
        raise EvidenceError(f"{path}: multiple sesion identities cannot be aggregated")
    result = []
    for run in RUNS:
        items = groups[run]
        valid = [item for item in items if item["valid"]]
        values = sorted(item["fps"] for item in valid)
        below = sum(value < 55 for value in values)
        complete = {item["segment"] for item in valid} == set(range(1, 11))
        status = "FAIL" if below else "PASS" if complete and all(item["trace"] and item["source"] for item in valid) else "PENDING"
        result.append({"profile": "f3-500", "recorrido": run, "status": status,
                       "attempts": len(items), "valid": len(valid), "invalid": len(items) - len(valid),
                       "missing_segments": sorted(set(range(1, 11)) - {item["segment"] for item in valid}),
                       "missing_trace_sha256": sum(not item["trace"] for item in valid),
                       "below_55_fps": below, "min_fps": float(values[0]) if values else None,
                       "median_fps": float(median(values)) if values else None,
                       "mean_fps": float(sum(values) / len(values)) if values else None})
    return {"groups": result, "total_attempts": len(rows), "session_id": next(iter(sessions), None)}


def validate_session(path):
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise EvidenceError(f"{path}: malformed/unreadable JSON: {error}") from error
    if not isinstance(data, dict) or not isinstance(data.get("apk"), dict) or not isinstance(data.get("dispositivo"), dict):
        raise EvidenceError(f"{path}: session must be an object with apk and dispositivo objects")
    for field in ("archivosEvidenciaYHashes", "limitaciones"):
        if field in data and not isinstance(data[field], list):
            raise EvidenceError(f"{path}: {field} must be an array")
    identity = {key: data.get(key) for key in ("protocolo", "operador", "fecha", "husoHorario", "shaFuente", "datasetSha256", "zipSha256", "perfil", "herramientaVersionOpciones")}
    identity["apk"] = {key: data["apk"].get(key) for key in ("versionName", "versionCode", "variante", "sha256", "certificadoSha256")}
    identity["dispositivo"] = {key: data["dispositivo"].get(key) for key in ("modelo", "android", "api", "webview", "resolucion", "hz")}
    critical = ("operador", "fecha", "husoHorario", "shaFuente", "datasetSha256", "apk.versionName", "apk.versionCode", "apk.variante", "apk.sha256", "dispositivo.modelo", "dispositivo.android", "dispositivo.webview", "archivosEvidenciaYHashes")
    missing = []
    for key in critical:
        value = data.get(key) if "." not in key else data[key.split(".")[0]].get(key.split(".")[1])
        if value is None or value == "" or value == []:
            missing.append(key)
        elif key == "archivosEvidenciaYHashes" and not isinstance(value, list):
            raise EvidenceError(f"{path}: invalid session identity type for {key}")
        elif key != "archivosEvidenciaYHashes" and (not isinstance(value, (str, int)) or isinstance(value, bool)):
            raise EvidenceError(f"{path}: invalid session identity type for {key}")
    for key in ("shaFuente", "datasetSha256", "zipSha256"):
        check_sha(data.get(key), key, path)
    for key in ("sha256", "certificadoSha256"):
        check_sha(data["apk"].get(key), f"apk.{key}", path)
    if data.get("protocolo") != "F3-v1":
        raise EvidenceError(f"{path}: expected protocolo F3-v1")
    return {"status": "PENDING" if missing else "PASS", "identity": identity,
            "evidence_files": data.get("archivosEvidenciaYHashes", []), "missing_critical": missing}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--crud", type=Path, help="CSV copied from crud.template.csv")
    parser.add_argument("--frames", type=Path, help="CSV copied from frames.template.csv")
    parser.add_argument("--session", type=Path, help="optional sesion.template.json copy")
    parser.add_argument("--json-output", type=Path, help="write stable JSON summary without changing inputs")
    args = parser.parse_args()
    if not args.crud and not args.frames:
        parser.error("at least one of --crud or --frames is required")
    try:
        if args.json_output and any(args.json_output.resolve() == path.resolve() for path in (args.crud, args.frames, args.session) if path):
            raise EvidenceError("--json-output must not overwrite an input file")
        crud = validate_crud(args.crud) if args.crud else None
        frames = validate_frames(args.frames) if args.frames else None
        session = validate_session(args.session) if args.session else None
        if crud and frames and crud["session_id"] and frames["session_id"] and crud["session_id"] != frames["session_id"]:
            raise EvidenceError("CRUD and FPS CSV use different sesion identities")
        statuses = [group["status"] for section in (crud, frames) if section for group in section["groups"]]
        if session:
            statuses.append(session["status"])
        status = "FAIL" if "FAIL" in statuses else "PENDING" if "PENDING" in statuses else "PASS"
        report = {"schema_version": 1, "status": status, "crud": crud, "frames": frames, "session": session}
        if args.json_output:
            args.json_output.write_text(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"F3 evidence: {status} (valid structure; no Android capture performed)")
        if crud:
            for group in crud["groups"]:
                print(f"CRUD {group['profile']}/{group['operation']}: {group['status']} attempts={group['attempts']} valid={group['valid']} invalid={group['invalid']} warmups={group['warmups']} median={group['median_ms']} p95={group['p95_ms']} max={group['max_ms']} >200={group['over_200_ms']} functional={group['functional']} persistencia_median={group['persistencia_ms']['median_ms']} persistencia_missing={group['persistencia_ms']['missing']} refresco_median={group['refresco_ms']['median_ms']} refresco_missing={group['refresco_ms']['missing']} trace_sha_missing={group['missing_trace_sha256']} trace_offsets_missing={group['missing_trace_offsets']}")
        if frames:
            for group in frames["groups"]:
                print(f"FPS f3-500/{group['recorrido']}: {group['status']} attempts={group['attempts']} valid={group['valid']} invalid={group['invalid']} missing_segments={group['missing_segments']} missing_trace={group['missing_trace_sha256']} min={group['min_fps']} median={group['median_fps']} mean={group['mean_fps']} <55={group['below_55_fps']}")
        if session:
            print(f"Session identity: {session['status']} missing={','.join(session['missing_critical']) or 'none'}")
            identity = session["identity"]
            print(f"Traceability: source={identity['shaFuente']} dataset={identity['datasetSha256']} apk={identity['apk']} device={identity['dispositivo']} evidence_files={len(session['evidence_files'])}")
    except (EvidenceError, OSError) as error:
        print(f"F3 evidence error: {error}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
