import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button, FormControl, IconButton, Input, Select, SelectItem } from "@app/components/v2";
import { PermissionConditionOperators } from "@app/context/ProjectPermissionContext/types";

import { TFormSchema } from "../ProjectRoleModifySection.utils";

type Props = {
  position?: number;
};

export const SecretPermissionConditions = ({ position = 0 }: Props) => {
  const { control } = useFormContext<TFormSchema>();
  const items = useFieldArray({
    control,
    name: `permissions.secrets.${position}.conditions`
  });

  return (
    <div className="mt-6 border-t border-t-gray-800 bg-mineshaft-800 pt-2">
      <div className="mt-2 flex flex-col space-y-2">
        {items.fields.map((el, index) => (
          <div
            key={el.id}
            className="flex gap-2 bg-mineshaft-800 first:rounded-t-md last:rounded-b-md"
          >
            <div className="w-1/4">
              <Controller
                control={control}
                name={`permissions.secrets.${position}.conditions.${index}.lhs`}
                render={({ field, fieldState: { error } }) => (
                  <FormControl
                    isError={Boolean(error?.message)}
                    errorText={error?.message}
                    className="mb-0"
                  >
                    <Select
                      defaultValue={field.value}
                      {...field}
                      onValueChange={(e) => field.onChange(e)}
                      className="w-full"
                    >
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="secretPath">Secret Path</SelectItem>
                      <SelectItem value="secretName">Secret Name</SelectItem>
                    </Select>
                  </FormControl>
                )}
              />
            </div>
            <div className="w-36">
              <Controller
                control={control}
                name={`permissions.secrets.${position}.conditions.${index}.operator`}
                render={({ field, fieldState: { error } }) => (
                  <FormControl
                    isError={Boolean(error?.message)}
                    errorText={error?.message}
                    className="mb-0 flex-grow"
                  >
                    <Select
                      defaultValue={field.value}
                      {...field}
                      onValueChange={(e) => field.onChange(e)}
                      className="w-full"
                    >
                      <SelectItem value={PermissionConditionOperators.$EQ}>Equal</SelectItem>
                      <SelectItem value={PermissionConditionOperators.$NEQ}>Not Equal</SelectItem>
                      <SelectItem value={PermissionConditionOperators.$GLOB}>Glob Match</SelectItem>
                      <SelectItem value={PermissionConditionOperators.$REGEX}>
                        Regex Match
                      </SelectItem>
                      <SelectItem value={PermissionConditionOperators.$IN}>Contains</SelectItem>
                      <SelectItem value={PermissionConditionOperators.$ALL}>All</SelectItem>
                    </Select>
                  </FormControl>
                )}
              />
            </div>
            <div className="flex-grow">
              <Controller
                control={control}
                name={`permissions.secrets.${position}.conditions.${index}.rhs`}
                render={({ field, fieldState: { error } }) => (
                  <FormControl
                    isError={Boolean(error?.message)}
                    errorText={error?.message}
                    className="mb-0 flex-grow"
                  >
                    <Input {...field} placeholder="value" />
                  </FormControl>
                )}
              />
            </div>
            <div>
              <IconButton
                ariaLabel="plus"
                variant="outline_bg"
                className="p-2.5"
                onClick={() => items.remove(index)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
      <Button
        leftIcon={<FontAwesomeIcon icon={faPlus} />}
        variant="star"
        size="xs"
        className="mt-3"
        onClick={() =>
          items.append({
            lhs: "environment",
            operator: PermissionConditionOperators.$EQ,
            rhs: ""
          })
        }
      >
        New Condition
      </Button>
    </div>
  );
};
