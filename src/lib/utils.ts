import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function searchParamsToString(object: { [x: string]: any }) {
  let param = "?";
  Object.keys(object)
    .filter((key) => object[key] !== undefined)
    // eslint-disable-next-line array-callback-return
    .map((key, index) => {
      // check if end of map and add & if not
      const valueToAdd =
        typeof object[key] === "string"
          ? object[key]
          : JSON.stringify(object[key]);

      if (index === Object.keys(object).length - 1)
        param += `${key}=${valueToAdd}`;
      else param += `${key}=${valueToAdd}&`;
    });

  return param;
}
