// Es el mismo preset que Metro aplica por defecto al compilar la app, asi que
// declararlo explicitamente no cambia el comportamiento del build nativo.
// Hace falta porque Jest no hereda la configuracion implicita de Expo y no
// sabria transformar los archivos de React Native (que llevan tipos Flow).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
