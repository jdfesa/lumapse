# Requisitos No Funcionales — Lumapse

**Fase Design Thinking:** Idear / Prototipar  
**Última actualización:** Abril 2026  
**Autor:** José David Sandoval

---

## Convenciones

- **ID:** `RNF-XXX` (Requisito No Funcional)
- **Categoría:** Clasificación según el modelo de calidad ISO/IEC 25010
- **Métrica:** Criterio de aceptación objetivo y verificable
- **Verificación:** Cómo se valida que el requisito se cumple

---

## Rendimiento (Performance)

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-001 | La aplicación debe cargar y ser interactiva en menos de **3 segundos** en una conexión 3G simulada. | Time to Interactive (TTI) ≤ 3s | Lighthouse en modo 3G throttling |
| RNF-002 | El tiempo de respuesta al crear, editar o eliminar una nota no debe superar **200ms**. | Latencia de operación CRUD ≤ 200ms | Medición con `performance.now()` en DevTools |
| RNF-003 | El bundle de producción (sin assets estáticos) no debe superar **500 KB** comprimido (gzip). | Bundle size ≤ 500 KB gzip | Output de `vite build` |
| RNF-004 | La aplicación debe mantener un rendimiento fluido (60 fps) durante el scrolleo del listado de notas con al menos **500 notas** almacenadas. | FPS ≥ 55 durante scroll | Chrome DevTools Performance tab |

---

## Usabilidad

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-005 | Un usuario nuevo debe poder **crear su primera nota en menos de 10 segundos** desde la primera carga de la app, sin instrucciones previas. | Tiempo a primera nota ≤ 10s | Test con usuario real (Hito 05) |
| RNF-006 | Toda función principal (crear, buscar, exportar) debe ser accesible en **máximo 2 clicks/taps** desde la pantalla principal. | Profundidad de navegación ≤ 2 | Revisión de flujo de UI |
| RNF-007 | La tipografía mínima legible debe ser **16px** en dispositivos móviles. | font-size ≥ 16px en viewport < 768px | Inspección CSS |
| RNF-008 | Los elementos interactivos (botones, links) deben tener un área de toque mínima de **44x44 px** en dispositivos táctiles. | Touch target ≥ 44x44 px | Lighthouse accessibility audit |

---

## Disponibilidad y Confiabilidad (Reliability)

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-009 | La aplicación debe funcionar **100% offline** después de la primera visita con conexión. | Todas las funcionalidades disponibles sin red | Test manual en modo avión |
| RNF-010 | Los datos del usuario no deben perderse ante un cierre inesperado del navegador (crash, batería agotada). | Pérdida de datos = 0 notas tras crash | Auto-guardado persistente en IndexedDB cada 3s |
| RNF-011 | El Service Worker debe cachear correctamente todos los assets estáticos para garantizar la disponibilidad offline. | Cache hit rate = 100% para assets | Lighthouse PWA audit |

---

## Seguridad y Privacidad

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-012 | La aplicación **no debe enviar datos del usuario a ningún servidor externo**, bajo ninguna circunstancia. | Requests de red con payload de usuario = 0 | Network tab en DevTools durante uso completo |
| RNF-013 | La aplicación no debe incluir **tracking, analytics ni cookies de terceros**. | Scripts de terceros = 0 | Auditoría manual del bundle |
| RNF-014 | El sitio debe servirse exclusivamente sobre **HTTPS** en producción (GitHub Pages lo proporciona por defecto). | Certificado SSL/TLS válido | Verificación en navegador |
| RNF-015 | Los headers de seguridad básicos deben estar presentes: `X-Content-Type-Options`, `X-Frame-Options`. | Headers presentes en response | Verificación con herramienta online (securityheaders.com) |

---

## Portabilidad

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-016 | La aplicación debe funcionar correctamente en los **últimos 2 major versions** de: Chrome, Firefox, Safari y Edge. | Funcionalidad completa en 4 navegadores | Test manual en cada navegador |
| RNF-017 | La aplicación debe ser **instalable como PWA** en Android (Chrome), iOS (Safari) y desktop (Chrome/Edge). | Prompt de instalación disponible | Test manual en cada plataforma |
| RNF-018 | Las notas exportadas deben ser archivos `.md` estándar, legibles en cualquier editor de texto. | Archivos exportados abren en VS Code, Notepad, vim | Test manual |

---

## Accesibilidad

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-019 | La aplicación debe alcanzar un score mínimo de **90/100 en Lighthouse Accessibility**. | Lighthouse Accessibility ≥ 90 | `lighthouse --only-categories=accessibility` |
| RNF-020 | Todos los elementos interactivos deben ser navegables por **teclado** (Tab, Enter, Escape). | Flujo completo navegable sin mouse | Test manual con teclado |
| RNF-021 | Los colores deben cumplir un **ratio de contraste mínimo de 4.5:1** (WCAG AA) para texto normal. | Contrast ratio ≥ 4.5:1 | Herramienta de contraste (WebAIM) |
| RNF-022 | Todos los elementos no decorativos deben tener **atributos `aria-label`** o texto alternativo. | Elementos sin label accesible = 0 | Lighthouse + revisión manual |

---

## Mantenibilidad

| ID | Requisito | Métrica | Verificación |
|---|---|---|---|
| RNF-023 | El código debe seguir una **estructura modular** con separación clara entre componentes, servicios y estilos. | Cada módulo tiene una sola responsabilidad | Revisión de la estructura `src/` |
| RNF-024 | Los **tests unitarios** deben cubrir al menos el **70%** de la lógica de negocio (servicios). | Coverage de servicios ≥ 70% | `vitest --coverage` |
| RNF-025 | El proyecto debe construirse sin errores con un único comando: `npm run build`. | Exit code = 0 sin warnings | CI/CD o test manual |
| RNF-026 | Toda decisión arquitectónica significativa debe estar documentada en un **ADR** antes de implementarse. | ADR existe para cada decisión | Revisión de `docs/adr/` |

---

## Resumen por categoría

| Categoría | Cantidad | IDs |
|---|---|---|
| Rendimiento | 4 | RNF-001 a RNF-004 |
| Usabilidad | 4 | RNF-005 a RNF-008 |
| Disponibilidad | 3 | RNF-009 a RNF-011 |
| Seguridad | 4 | RNF-012 a RNF-015 |
| Portabilidad | 3 | RNF-016 a RNF-018 |
| Accesibilidad | 4 | RNF-019 a RNF-022 |
| Mantenibilidad | 4 | RNF-023 a RNF-026 |
| **Total** | **26** | |

---

## Verificación planificada

| Hito | Verificaciones |
|---|---|
| **03** (Julio) | RNF-001, RNF-003, RNF-009, RNF-011, RNF-014, RNF-017 |
| **04** (Agosto) | RNF-005, RNF-006, RNF-007, RNF-008, RNF-016, RNF-020, RNF-021, RNF-022 |
| **05** (Septiembre) | RNF-002, RNF-004, RNF-012, RNF-013, RNF-015, RNF-019, RNF-024, RNF-025 |
| **06** (Octubre) | Verificación final de todos los RNF — informe de cumplimiento |

---

> **Nota:** Las métricas definidas en este documento son criterios de aceptación. Al cierre del proyecto (Hito 06), se generará un informe de cumplimiento que documente el resultado de cada verificación con evidencia (screenshots de Lighthouse, capturas de DevTools, resultados de tests).

---

*Documento de la fase Idear / Prototipar · Design Thinking · Lumapse · PP3 · 2026*
