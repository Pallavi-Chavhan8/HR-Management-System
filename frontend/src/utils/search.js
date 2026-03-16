const collectValues = (input) => {
  if (input === null || input === undefined) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => collectValues(item));
  }

  if (typeof input === "object") {
    return Object.values(input).flatMap((value) => collectValues(value));
  }

  return [String(input)];
};

export const matchesKeywordInObject = (record, keyword) => {
  const normalizedKeyword = String(keyword || "").trim().toLowerCase();

  if (!normalizedKeyword) {
    return true;
  }

  const haystack = collectValues(record)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedKeyword);
};
