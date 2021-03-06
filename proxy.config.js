const PROXY_CONFIG = [
  {
      context: [
          "/auth",
          "/security",
          "/user",
          "/projects"
      ],
      // target: "http://192.168.30.188:8762",
      target: "http://condonuityappdev.eastus2.cloudapp.azure.com:8762",
      // target: "https://condonuityappdev.eastus2.cloudapp.azure.com",

      secure: false
  }

]

module.exports = PROXY_CONFIG;