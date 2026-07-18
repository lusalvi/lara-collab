import AppIcon from "@/components/AppIcon";
import { reloadWithoutQueryParams } from "@/utils/route";
import { TextInput } from "@mantine/core";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { useState } from "react";

export default function SearchInput({ search, ...props }) {
  const [value, setValue] = useState(route().params.search || "");
  const [debounced] = useDebouncedValue(value, 250);

  useDidUpdate(() => {
    if (debounced !== "") search(debounced);
    else reloadWithoutQueryParams({ exclude: ["search"] });
  }, [debounced]);

  return (
    <TextInput
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      radius="xl"
      leftSectionWidth={42}
      leftSection={
        <AppIcon
          name="search"
          size={18}
        />
      }
      rightSectionWidth={38}
      rightSection={
        debounced !== "" && (
          <div
            onClick={() => setValue("")}
            style={{ cursor: "pointer", display: "flex" }}
          >
            <AppIcon
              name="close"
              size={18}
            />
          </div>
        )
      }
      {...props}
    />
  );
}