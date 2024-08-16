const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Throttle es una función envolvente que establece variables de estado para las solicitudes limitadas.
 **/
function Throttle() {
  // Configuración del estado
  let startedAt = null;
  let timesCalled = 0;
  let inThrottle = false;

  /**
   * La segunda función envolvente establece los parámetros para la limitación (intervalo y número límite de solicitudes por intervalo)
   * @param {function} fn función que se usará.
   * @param {object} opts parámetros de intervalo y límite.
   * @return función decoradora para @param {function} fn
   */
  return function settingOptions(fn, opts) {
    const ms = opts.interval;
    const number = opts.limit;

    /**
     * Decorador para la función de settingOption del padre @function.
     * La función es básicamente una declaración if else, que verifica si la función podría ejecutarse en este momento o necesita esperar hasta el final de un retraso.
     * Para la condición, utiliza las opciones de intervalo y límite y las compara con las variables de estado.
     * @return resultado de la función ejecutada desde la función de settingOption del padre @function
     */
    return async function returnedFunction(...args) {
      // Establece la variable de fecha si está vacía
      if (!startedAt) startedAt = Date.now();

      if (timesCalled < number && Date.now() - startedAt < ms) {
        // Ejecuta la función del padre
        timesCalled++;
        const result = await fn(...args);
        return result;
      }

      if (!inThrottle) {
        inThrottle = true;
        await sleep(ms);
        // Restablece las condiciones después del retraso
        timesCalled = 0;
        startedAt = Date.now();
        // Devuelve la función llamada
        const result = await returnedFunction(...args);
        inThrottle = false;
        return result;
      }

      // Espera hasta que finalice el retraso
      const checkingPromise = new Promise(resolve => {
        const interval = setInterval(async () => {
          if (!inThrottle) {
            clearInterval(interval);
            const result = await returnedFunction(...args);
            // Resuelve la función ejecutada
            return resolve(result);
          }
        }, 1);
      });
      const result = await checkingPromise;
      return result;
    };
  };
}

const throttledRequest = Throttle();
module.exports = throttledRequest;