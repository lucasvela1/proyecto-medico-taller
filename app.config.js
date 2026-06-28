module.exports = ({ config }) => {
  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
    },
  };
};
