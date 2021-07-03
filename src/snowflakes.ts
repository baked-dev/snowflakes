import { createHash } from "crypto";

const sha1_2 = (data: string) =>
  createHash("sha256").update(data).digest("hex");

export interface SnowflakeData {
  type: string;
  seq: number;
  sig: string;
  ts: Date;
  data: string;
  parents_data: string[];
}

class Snowflakes {
  private epoch: number = 1618868000000;
  private seq: number = 0;

  public constructor(
    private signing_key: string,
    private node_id: number = 1023
  ) {}

  public sign = (type: string, ...payloads: string[]) =>
    sha1_2(
      `${payloads.reduce((acc, val) => acc + val, "")}${
        this.signing_key
      }${type}`
    )
      .substr(0, payloads[0].length)
      .substr(0, payloads[0].length)
      .split("")
      .reduce((acc, val, idx) => {
        return (
          acc + val + payloads.reduce((acc2, val2) => acc2 + val2[idx], "")
        );
      }, "");

  public gen = (
    type: string,
    parent: string = undefined,
    ts: number = Date.now()
  ) => {
    this.seq++;
    if (this.seq > 4095) this.seq = 0;

    const parsed_parent = parent ? this.read(parent) : undefined;

    const bin = `${(ts - this.epoch).toString(2).padStart(48, "0")}${(
      this.node_id & 1023
    )
      .toString(2)
      .padStart(10, "0")}${this.seq.toString(2).padStart(12, "0")}`;

    const final = parseInt(bin, 2).toString(16);

    const args = [final];

    if (parsed_parent) {
      args.push(parsed_parent.data.split("").reverse().join(""));
      args.push(
        ...parsed_parent.parents_data.map((parent_data) =>
          parent_data.split("").reverse().join("")
        )
      );
    }

    return `${type}_${this.sign(type, ...args)}`;
  };

  public verify = (snowflake: string): SnowflakeData | false => {
    const result = this.read(snowflake);
    if (!result) throw new Error("Error while parsing snowflake.");

    const { sig, data, parents_data, type } = result;

    const computed_hash = sha1_2(
      `${[
        data,
        ...parents_data.map((str) => str.split("").reverse().join("")),
      ].reduce((acc, val) => acc + val, "")}${this.signing_key}${type}`
    );

    if (!computed_hash.startsWith(sig))
      throw new Error("Could not verify snowflake integrity.");

    return result;
  };

  public parseHex = (hex: string) =>
    this.parseBin(parseInt(hex, 16).toString(2).padStart(70, "0"));

  public parseBin = (bin: string) => {
    const bin_ts = bin.substr(0, 48);
    const ts = parseInt(bin_ts, 2) + this.epoch;

    const bin_seq = bin.substr(58);
    const seq = parseInt(bin_seq, 2);

    return {
      ts,
      seq,
    };
  };

  public read = (snowflake: string): SnowflakeData | false => {
    try {
      const [type, raw] = snowflake.split(/_(?!.*_)/g);

      if (raw.length % 14 !== 0) return false;

      const r = this.parse(raw);

      const [sig, data, ...parents_data] = r;

      const { seq, ts } = this.parseHex(data);

      return {
        type,
        sig,
        seq,
        data,
        ts: new Date(ts),
        parents_data: parents_data.map((data) =>
          data.split("").reverse().join("")
        ),
      };
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  public getParent = (data: SnowflakeData, type: string) =>
    `${type}_${this.sign(
      type,
      data.parents_data.shift(),
      ...data.parents_data.map((parent_data) =>
        parent_data.split("").reverse().join("")
      )
    )}`;

  private parse = (data: string): string[] =>
    data.split("").reduce((acc, val, idx) => {
      const amt = data.length / 14;
      idx = idx % amt;
      acc[idx] = (acc[idx] ?? "") + val;
      return acc;
    }, []);
}

export default Snowflakes;
