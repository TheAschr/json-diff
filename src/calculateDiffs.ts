import { jsonLintParser } from "./jsonLintParser";

type Data = Record<string, any>;

type Value = Data | string | number | boolean | null;

interface Path {
  line: number;
}

type DiffType = "missing" | "type" | "eq";

export interface Diff {
  path1: Path;
  path2: Path;
  type: DiffType;
  msg: string;
}

interface Config {
  out: string;
  indent: number;
  paths: {
    line: number;
    path: string;
  }[];
  currentPath: string[];
  line: number;
}

const SEPERATOR = "/";

const DEFAULT_CONFIG: Config = {
  out: "",
  indent: -1,
  currentPath: [],
  paths: [],
  line: 1,
};

function getInputError(json: string) {
  try {
    jsonLintParser.parse(json);
    return null;
  } catch (parseException) {
    // @ts-ignore
    return parseException.message;
  }
}

function generatePath(config: Config, prop?: string) {
  let s = "";
  config.currentPath.forEach((path) => {
    s += path;
  });

  if (prop) {
    s += SEPERATOR + prop.replace(SEPERATOR, "#");
  }

  if (s.length === 0) {
    return SEPERATOR;
  } else {
    return s;
  }
}

function startArray(config: Config) {
  config.indent++;
  config.out += "[";

  if (config.paths.length === 0) {
    /*
     * Then we are at the top of the array and we want to add
     * a path for it.
     */
    config.paths.push({
      path: generatePath(config),
      line: config.line,
    });
  }

  if (config.indent === 0) {
    config.indent++;
  }
}

function finishArray(config: Config) {
  if (config.indent === 0) {
    config.indent--;
  }

  removeTrailingComma(config);

  config.indent--;
  config.out += newLine(config) + getTabs(config.indent) + "]";
  if (config.indent !== 0) {
    config.out += ",";
  } else {
    config.out += newLine(config);
  }
}

function getTabs(indent: number) {
  let s = "";
  for (let i = 0; i < indent; i++) {
    s += "    ";
  }

  return s;
}

function newLine(config: Config) {
  config.line++;
  return "\n";
}

function removeTrailingComma(config: Config) {
  /*
   * Remove the trailing comma
   */
  if (config.out.charAt(config.out.length - 1) === ",") {
    config.out = config.out.substring(0, config.out.length - 1);
  }
}

function unescapeString(val: string) {
  if (val) {
    return val
      .replace("\\", "\\\\") // Single slashes need to be replaced first
      .replace(/"/g, '\\"') // Then double quotes
      .replace(/\n/g, "\\n") // New lines
      .replace("\b", "\\b") // Backspace
      .replace(/\f/g, "\\f") // Formfeed
      .replace(/\r/g, "\\r") // Carriage return
      .replace(/\t/g, "\\t"); // Horizontal tabs
  } else {
    return val;
  }
}

function formatVal(val: Value, config: Config) {
  if (Array.isArray(val)) {
    config.out += "[";

    config.indent++;
    val.forEach((arrayVal, index: number) => {
      config.out += newLine(config) + getTabs(config.indent);
      config.paths.push({
        path: generatePath(config, "[" + index + "]"),
        line: config.line,
      });

      config.currentPath.push(SEPERATOR + "[" + index + "]");
      formatVal(arrayVal, config);
      config.currentPath.pop();
    });
    removeTrailingComma(config);
    config.indent--;

    config.out += newLine(config) + getTabs(config.indent) + "],";
  } else if (typeof val === "object" && val !== null) {
    formatAndDecorate(config, val);
  } else if (typeof val === "string") {
    config.out += '"' + unescapeString(val) + '",';
  } else if (typeof val === "number") {
    config.out += val + ",";
  } else if (typeof val === "boolean") {
    config.out += val + ",";
  } else if (val === null) {
    config.out += "null,";
  }
}

function formatAndDecorateArray(config: Config, data: Data[]) {
  startArray(config);

  /*
   * If the first set has more than the second then we will catch it
   * when we compare values.  However, if the second has more then
   * we need to catch that here.
   */
  data.forEach((arrayVal, index: number) => {
    config.out += newLine(config) + getTabs(config.indent);
    config.paths.push({
      path: generatePath(config, "[" + index + "]"),
      line: config.line,
    });

    config.currentPath.push(SEPERATOR + "[" + index + "]");
    formatVal(arrayVal, config);
    config.currentPath.pop();
  });

  finishArray(config);
  config.currentPath.pop();
}

function startObject(config: Config) {
  config.indent++;
  config.out += "{";

  if (config.paths.length === 0) {
    /*
     * Then we are at the top of the object and we want to add
     * a path for it.
     */
    config.paths.push({
      path: generatePath(config),
      line: config.line,
    });
  }

  if (config.indent === 0) {
    config.indent++;
  }
}

function getSortedProperties(obj: Data) {
  let props: string[] = [];

  for (const prop in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(prop)) {
      props.push(prop);
    }
  }

  props = props.sort((a, b) => {
    return a.localeCompare(b);
  });

  return props;
}

function finishObject(config: Config) {
  if (config.indent === 0) {
    config.indent--;
  }

  removeTrailingComma(config);

  config.indent--;
  config.out += newLine(config) + getTabs(config.indent) + "}";
  if (config.indent !== 0) {
    config.out += ",";
  } else {
    config.out += newLine(config);
  }
}

function formatAndDecorate(config: Config, data: Data) {
  if (Array.isArray(data)) {
    formatAndDecorateArray(config, data);
    return;
  }

  startObject(config);
  config.currentPath.push(SEPERATOR);

  const props = getSortedProperties(data);

  /*
   * If the first set has more than the second then we will catch it
   * when we compare values.  However, if the second has more then
   * we need to catch that here.
   */
  props.forEach((key) => {
    config.out +=
      newLine(config) +
      getTabs(config.indent) +
      '"' +
      unescapeString(key) +
      '": ';
    config.currentPath.push(key.replace(SEPERATOR, "#"));
    config.paths.push({
      path: generatePath(config),
      line: config.line,
    });
    formatVal(data[key], config);
    config.currentPath.pop();
  });

  finishObject(config);
  config.currentPath.pop();
}

function generateDiff(
  config1: Config,
  path1: string,
  config2: Config,
  path2: string,
  msg: string,
  type: DiffType
): Diff {
  if (path1 !== SEPERATOR && path1.charAt(path1.length - 1) === SEPERATOR) {
    path1 = path1.substring(0, path1.length - 1);
  }

  if (path2 !== SEPERATOR && path2.charAt(path2.length - 1) === SEPERATOR) {
    path2 = path2.substring(0, path2.length - 1);
  }
  const pathObj1 = config1.paths.find((path) => {
    return path.path === path1;
  });
  const pathObj2 = config2.paths.find((path) => {
    return path.path === path2;
  });

  if (!pathObj1) {
    throw new Error("Unable to find line number for (" + msg + "): " + path1);
  }

  if (!pathObj2) {
    throw new Error("Unable to find line number for (" + msg + "): " + path2);
  }

  return {
    path1: pathObj1,
    path2: pathObj2,
    type,
    msg,
  };
}

function diffArray(
  diffs: Diff[],
  val1: Data[],
  config1: Config,
  val2: Data[],
  config2: Config
) {
  if (!Array.isArray(val2)) {
    diffs.push(
      generateDiff(
        config1,
        generatePath(config1),
        config2,
        generatePath(config2),
        "Both types should be arrays",
        "type"
      )
    );
    return;
  }

  if (val1.length < val2.length) {
    /*
     * Then there were more elements on the right side and we need to
     * generate those differences.
     */
    for (let i = val1.length; i < val2.length; i++) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2, "[" + i + "]"),
          "Missing element <code>" +
            i +
            "</code> from the array on the left side",
          "missing"
        )
      );
    }
  }
  val1.forEach((_, index) => {
    if (val2.length <= index) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1, "[" + index + "]"),
          config2,
          generatePath(config2),
          "Missing element <code>" +
            index +
            "</code> from the array on the right side",
          "missing"
        )
      );
    } else {
      config1.currentPath.push(SEPERATOR + "[" + index + "]");
      config2.currentPath.push(SEPERATOR + "[" + index + "]");

      if (Array.isArray(val2)) {
        /*
         * If both sides are arrays then we want to diff them.
         */
        diffVal(diffs, val1[index], config1, val2[index], config2);
      }
      config1.currentPath.pop();
      config2.currentPath.pop();
    }
  });
}

function findDiffs(
  diffs: Diff[],
  config1: Config,
  data1: Data,
  config2: Config,
  data2: Data
) {
  config1.currentPath.push(SEPERATOR);
  config2.currentPath.push(SEPERATOR);

  if (data1.length < data2.length) {
    /*
     * This means the second data has more properties than the first.
     * We need to find the extra ones and create diffs for them.
     */
    for (const key in data2) {
      // eslint-disable-next-line no-prototype-builtins
      if (data2.hasOwnProperty(key)) {
        // eslint-disable-next-line no-prototype-builtins
        if (!data1.hasOwnProperty(key)) {
          diffs.push(
            generateDiff(
              config1,
              generatePath(config1),
              config2,
              generatePath(config2, SEPERATOR + key),
              "The right side of this object has more items than the left side",
              "missing"
            )
          );
        }
      }
    }
  }

  /*
   * Now we're going to look for all the properties in object one and
   * compare them to object two
   */
  for (const key in data1) {
    // eslint-disable-next-line no-prototype-builtins
    if (data1.hasOwnProperty(key)) {
      config1.currentPath.push(key.replace(SEPERATOR, "#"));
      // eslint-disable-next-line no-prototype-builtins
      if (!data2.hasOwnProperty(key)) {
        /*
         * This means that the first data has a property which
         * isn't present in the second data
         */
        diffs.push(
          generateDiff(
            config1,
            generatePath(config1),
            config2,
            generatePath(config2),
            "Missing property <code>" +
              key +
              "</code> from the object on the right side",
            "missing"
          )
        );
      } else {
        config2.currentPath.push(key.replace(SEPERATOR, "#"));

        diffVal(diffs, data1[key], config1, data2[key], config2);
        config2.currentPath.pop();
      }
      config1.currentPath.pop();
    }
  }

  config1.currentPath.pop();
  config2.currentPath.pop();

  /*
   * Now we want to look at all the properties in object two that
   * weren't in object one and generate diffs for them.
   */
  for (const key in data2) {
    // eslint-disable-next-line no-prototype-builtins
    if (data2.hasOwnProperty(key)) {
      // eslint-disable-next-line no-prototype-builtins
      if (!data1.hasOwnProperty(key)) {
        diffs.push(
          generateDiff(
            config1,
            generatePath(config1),
            config2,
            generatePath(config2, key),
            "Missing property <code>" +
              key +
              "</code> from the object on the left side",
            "missing"
          )
        );
      }
    }
  }
}

function diffBool(
  diffs: Diff[],
  val1: Value,
  config1: Config,
  val2: Value,
  config2: Config
) {
  if (typeof val2 !== "boolean") {
    diffs.push(
      generateDiff(
        config1,
        generatePath(config1),
        config2,
        generatePath(config2),
        "Both types should be booleans",
        "type"
      )
    );
  } else if (val1 !== val2) {
    if (val1) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "The left side is <code>true</code> and the right side is <code>false</code>",
          "eq"
        )
      );
    } else {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "The left side is <code>false</code> and the right side is <code>true</code>",
          "eq"
        )
      );
    }
  }
}

function diffVal(
  diffs: Diff[],
  val1: Data | Data[],
  config1: Config,
  val2: Data | Data[],
  config2: Config
) {
  if (Array.isArray(val1)) {
    if (!Array.isArray(val2)) {
      throw new Error("Expected val2 to be an Array");
    }
    diffArray(diffs, val1, config1, val2, config2);
  } else if (typeof val1 === "object" && val1 !== null) {
    if (
      Array.isArray(val2) ||
      typeof val2 === "string" ||
      typeof val2 === "number" ||
      typeof val2 === "boolean" ||
      val2 === null
    ) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "Both types should be objects",
          "type"
        )
      );
    } else {
      findDiffs(diffs, config1, val1, config2, val2);
    }
  } else if (typeof val1 === "string") {
    if (typeof val2 !== "string") {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "Both types should be strings",
          "type"
        )
      );
    } else if (val1 !== val2) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "Both sides should be equal strings",
          "eq"
        )
      );
    }
  } else if (typeof val1 === "number") {
    if (typeof val2 !== "number") {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "Both types should be numbers",
          "type"
        )
      );
    } else if (val1 !== val2) {
      diffs.push(
        generateDiff(
          config1,
          generatePath(config1),
          config2,
          generatePath(config2),
          "Both sides should be equal numbers",
          "eq"
        )
      );
    }
  } else if (typeof val1 === "boolean") {
    diffBool(diffs, val1, config1, val2, config2);
  } else if (val1 === null && val2 !== null) {
    diffs.push(
      generateDiff(
        config1,
        generatePath(config1),
        config2,
        generatePath(config2),
        "Both types should be nulls",
        "type"
      )
    );
  }
}

export type DiffSuccessfulResult = {
  valid: true;
  leftOutput: string;
  rightOutput: string;
  diffs: Diff[];
};
export type DiffFailedResult = {
  valid: false;
  leftInputErrorMessage: string | null;
  rightInputErrorMessage: string | null;
};

export type DiffResult = DiffSuccessfulResult | DiffFailedResult;

export function calculateDiffs({
  leftInput,
  rightInput,
}: {
  leftInput: string;
  rightInput: string;
}): DiffResult {
  const diffs: Diff[] = [];

  const leftInputErrorMessage = getInputError(leftInput);
  const rightInputErrorMessage = getInputError(rightInput);

  if (leftInputErrorMessage !== null || rightInputErrorMessage !== null) {
    return {
      valid: false,
      leftInputErrorMessage,
      rightInputErrorMessage,
    };
  }

  const leftValue: Data = JSON.parse(leftInput);
  const rightValue: Data = JSON.parse(rightInput);

  const leftConfig: Config = { ...DEFAULT_CONFIG };
  formatAndDecorate(leftConfig, leftValue);

  const rightConfig: Config = { ...DEFAULT_CONFIG };
  formatAndDecorate(rightConfig, rightValue);

  leftConfig.currentPath = [];
  rightConfig.currentPath = [];

  diffVal(diffs, leftValue, leftConfig, rightValue, rightConfig);

  return {
    valid: true,
    leftOutput: leftConfig.out,
    rightOutput: rightConfig.out,
    diffs: diffs.slice().sort((a, b) => a.path1.line - b.path1.line),
  };
}
