import { PluginFunc } from "dayjs";

const forceUtc: PluginFunc = (option, Dayjs, dayjs) => {
  const proto = Dayjs.prototype as any;

  const oldParse = proto.parse;
  proto.parse = function (cfg: any) {
    cfg.utc = true;
    oldParse.call(this, cfg);
  };
};

export default forceUtc;
