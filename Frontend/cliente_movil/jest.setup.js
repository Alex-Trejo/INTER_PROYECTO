// Simulacion de los modulos nativos que las pruebas unitarias no necesitan.
// Sin esto, importar los servicios fallaria porque no hay dispositivo real.

jest.mock("expo-secure-store", () => {
  const almacen = {};
  return {
    getItemAsync: jest.fn(async (k) => (k in almacen ? almacen[k] : null)),
    setItemAsync: jest.fn(async (k, v) => {
      almacen[k] = v;
    }),
    deleteItemAsync: jest.fn(async (k) => {
      delete almacen[k];
    }),
    __almacen: almacen,
  };
});

jest.mock("expo-notifications", () => ({
  setNotificationChannelAsync: jest.fn(async () => {}),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getDevicePushTokenAsync: jest.fn(async () => ({ data: "token-fcm-de-prueba" })),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { MAX: 5 },
  AndroidNotificationVisibility: { PUBLIC: 1 },
}));

jest.mock("expo-device", () => ({ isDevice: true }));

// Los iconos son puramente visuales y arrastran expo-font, que no resuelve
// fuera de un dispositivo. Se sustituyen por un texto con el nombre del icono.
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Icono = ({ name, ...resto }) => React.createElement(Text, resto, name);
  return { Ionicons: Icono, MaterialIcons: Icono, FontAwesome: Icono };
});
