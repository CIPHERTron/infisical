import { cloneElement } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { faChevronDown, faChevronRight, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";

import { Button, Checkbox, Tag } from "@app/components/v2";
import { ProjectPermissionSub } from "@app/context";
import { useToggle } from "@app/hooks";

import { TFormSchema, TProjectPermissionObject } from "../ProjectRoleModifySection.utils";

type Props<T extends ProjectPermissionSub> = {
  title: string;
  subject: T;
  actions: TProjectPermissionObject[T]["actions"];
  children?: JSX.Element;
};

export const GeneralPermissionOptions = <T extends keyof NonNullable<TFormSchema["permissions"]>>({
  subject,
  actions,
  children,
  title
}: Props<T>) => {
  const { control } = useFormContext<TFormSchema>();
  const items = useFieldArray({
    control,
    name: `permissions.${subject}`
  });
  const [isOpen, setIsOpen] = useToggle();

  if (!items.fields.length) return <div />;

  return (
    <div className="border border-mineshaft-600 bg-mineshaft-800 first:rounded-t-md last:rounded-b-md">
      <div
        className="flex cursor-pointer items-center space-x-8  px-5 py-4 text-sm text-gray-300"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen.toggle()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsOpen.toggle();
          }
        }}
      >
        <div>
          <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
        </div>
        <div className="flex-grow">{title}</div>
        {items.fields.length > 1 && (
          <div>
            <Tag size="xs" className="px-2">
              {items.fields.length} rules
            </Tag>
          </div>
        )}
      </div>
      {isOpen && (
        <motion.div
          key={`select-${subject}-type`}
          transition={{ duration: 0.3 }}
          initial={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateX: 10 }}
          className="flex flex-col space-y-4 bg-bunker-800 p-6"
        >
          {items.fields.map((el, rootIndex) => (
            <div key={el.id} className="bg-mineshaft-800 p-5 first:rounded-t-md last:rounded-b-md">
              <div className="flex text-gray-300">
                <div className="w-1/4">Actions</div>
                <div className="flex flex-grow flex-wrap justify-start gap-8">
                  {actions.map(({ label, value }) => {
                    if (typeof value !== "string") return undefined;
                    return (
                      <Controller
                        key={`${el.id}-${label}`}
                        name={`permissions.${subject}.${rootIndex}.${value}` as any}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <div className="flex items-center justify-center">
                            <Checkbox
                              isChecked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              id={`permissions.${subject}.${rootIndex}.${String(value)}`}
                            >
                              {label}
                            </Checkbox>
                          </div>
                        )}
                      />
                    );
                  })}
                </div>
              </div>
              {children &&
                cloneElement(children, {
                  position: rootIndex
                })}
              <div className="mt-2 flex justify-end space-x-4">
                {subject === ProjectPermissionSub.Secrets && (
                  <Button
                    leftIcon={<FontAwesomeIcon icon={faPlus} />}
                    variant="star"
                    size="xs"
                    className="mt-2"
                    onClick={() => items.insert(rootIndex, [{} as any])}
                  >
                    Add rule
                  </Button>
                )}
                <Button
                  leftIcon={<FontAwesomeIcon icon={faTrash} />}
                  variant="outline_bg"
                  size="xs"
                  className="mt-2 hover:border-red"
                  onClick={() => items.remove(rootIndex)}
                >
                  Remove Rule
                </Button>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
