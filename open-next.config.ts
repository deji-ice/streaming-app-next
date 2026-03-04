/** @type {import('open-next').OpenNextConfig} */
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
    },
  },
};

export default config;
