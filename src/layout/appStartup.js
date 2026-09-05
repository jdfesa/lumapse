import './appStartup.css'

// La preparación puede reintentarse; el montaje síncrono ocurre solo después de ella.
export function createAppStartup({ app, prepare, mount, beforeReload = () => {}, reload = () => window.location.reload() }) {
  let pending = null
  let mounted = false
  let needsReload = false
  let reloadPending = null

  function retryAfterPartialMount(button) {
    if (reloadPending || button.disabled) return
    button.disabled = true
    reloadPending = Promise.resolve().then(beforeReload).then(reload).catch(error => {
      console.error('[Lumapse] No se pudo liberar la conexión para reintentar:', error)
      showFailure()
    }).finally(() => { reloadPending = null })
  }

  function showFailure() {
    app.innerHTML = `
      <section class="startup-state" role="alert" aria-labelledby="startup-title">
        <h1 id="startup-title" tabindex="-1">No se pudo iniciar Lumapse</h1>
        <p>No pudimos abrir tus datos. No borres los datos de la aplicación.</p>
        <p>Podés reintentar de forma segura. Si el problema continúa, cerrá y volvé a abrir la aplicación.</p>
        <button id="startup-retry" type="button">Reintentar</button>
      </section>`
    app.querySelector('#startup-title').focus()
    app.querySelector('#startup-retry').addEventListener('click', event => {
      if (needsReload) {
        // La WebView no libera por sí sola el estado del plugin nativo.
        retryAfterPartialMount(event.currentTarget)
      }
      else void start()
    })
  }

  function start() {
    if (pending) return pending
    if (mounted) return Promise.resolve(true)
    if (needsReload) return Promise.resolve(false)
    app.innerHTML = '<section class="startup-state" role="status" aria-live="polite">Iniciando Lumapse…</section>'
    pending = Promise.resolve().then(async () => {
      await prepare()
      needsReload = true
      mount()
      mounted = true
      return true
    }).catch(error => {
      console.error('[Lumapse] No se pudo completar el arranque:', error)
      showFailure()
      return false // Frontera terminal: el DOM nunca recibe una promesa rechazada.
    }).finally(() => { pending = null })
    return pending
  }

  return { start }
}
