module.exports = ({ config }) => {
  const GOOGLE_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
    "AIzaSyAGoowL67JkTtIgo4XFgLkoYrVIHn4oX8M";

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: GOOGLE_API_KEY,
          iosGoogleMapsApiKey: GOOGLE_API_KEY,
        },
      ],
    ],
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: GOOGLE_API_KEY,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: GOOGLE_API_KEY,
        },
      },
    },
  };
};
