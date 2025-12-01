import { useCallback, useEffect, useState } from "react";
import {
  Card,
  TextContainer,
  Text,
  Select,
  TextField,
  Button,
  FormLayout,
  Page,
  LegacyCard,
  Badge,
  HorizontalStack,
  List,
  SkeletonDisplayText,
  SkeletonBodyText,
  Icon,
  SkeletonPage,
  Layout,
  AppProvider,
  Modal,
  EmptyState,
} from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { set } from "local-storage";
import { InlineStack } from "@shopify/checkout-ui-extensions";
import {
  AddMajor,
  AlertMinor,
  CircleAlertMajor,
  CircleCancelMajor,
  DeleteMinor,
  DragHandleMinor,
} from "@shopify/polaris-icons";
export function ProductsCard() {
  const META_OBJECT_TYPE = "payment_method_names",
    META_OBJECT_KEY = "original_name",
    FIELD_RENAME_NAME = "rename_value",
    META_OBJECT_KEY_TWO = "sortid",
    FIELD_NAME = "original_name",
    FIELD_TYPE = "single_line_text_field",
    isAdditionalMethod = "isAdditionalMethod";
  const emptyToastProps = { content: null };
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTwo, setIsLoadingTwo] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [toastProps, setToastProps] = useState(emptyToastProps);

  const [deletingId, setDeletingId] = useState(null); // null by default
  const [isSorted, setIsSort] = useState(null);
  const [_shopifyFunctions, setShopifyFunctions] = useState([]);
  const [isAddNew, setIsAddNew] = useState(false);
  const [isAppLoad, setIsAppLoad] = useState(true);
  const [newMethod, setNewMethod] = useState({});
  const fetch = useAuthenticatedFetch();
  const [customizationIds, setCustomizationIds] = useState(null);
  const [getNonMetaObjects, setNonMetaObjects] = useState(null);
  const [value, setValue] = useState([
    // {
    //   id: 9,
    //   sortId: 9,
    //   metaObjectId: "39399393",
    //   original: "(for testing) Bogus Gateway",
    //   rename: "logan",
    // },
  ]);
  const [selected, setSelected] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newMethods, setNewMethods] = useState([]);
  const [isActivated, setIsActivated] = useState(true);
  const [isMetaObjectsLoaded, setIsMetaObjectsLoaded] = useState(false);
  const [populate, setPopulate] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postPaymentMethodMetaObject, setPostPaymentMethodMetaObject] =
    useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [items, setItems] = useState([
    "Manual Methods (from Shopify)",
    "Additional Methods (custom/user-defined)",
  ]);
  const [items_two, setItems_two] = useState([
    "Manual methods: Cannot be deleted, only renamed or sorted",
    "Additional methods: Can be renamed, sorted, or deleted",
    "Each method must have a unique sort number",
    "Changes affect only the admin’s view (not actual Shopify gateways)",
    "Valid sort numbers range from 1 to the total number of methods configured",
    // "Range of valid sort numbers grows as more methods (manual or additional) are added, i.e if total 4 methods only 1-4 numbers are allowed as sort order",
  ]);

  const defaultListStyle = {
    marginTop: "10px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "gray",
    fontWeight: "500",
    marginLeft: "2px",
  };

  const bulletStyle = {
    display: "inline-block",
    // width: "1em",
    textAlign: "center",
    marginRight: "0.5em",
    fontSize: "1.2em", // Increase font size for a thicker appearance
    color: "black",
    fontWeight: "bold", // Make the bullet bolder
  };

  const handleChangeNonMetaObj = (newValue, id) => {
    if (!newValue) {
      setIsError(true);
    } else {
      if (isError) {
        setIsError(false);
      }
    }
    // if (!newValue) return;

    setNewMethods((prevValue) =>
      prevValue.map((method) =>
        method[isSorted ? "metaObjectId" : "id"] === id
          ? { ...method, [isSorted ? "sortId" : "rename"]: newValue }
          : method
      )
    );
  };
  const handleChange = (
    newValue,
    id,
    isSort = false,
    isDuplicate = false,
    index
  ) => {
    if (isAppLoad) {
      setIsAppLoad(false);
    }
    console.log("isduplicate", isDuplicate);
    // if (isDuplicate) {
    //   setIsError(true);
    // }
    if (!isDuplicate && isSort) {
      isDuplicate = value.find(
        (m, i) => i !== index && m.sortId === parseInt(newValue)
      )
        ? true
        : false;
    }

    if (!newValue || isDuplicate) {
      setIsError(true);
    } else {
      // if (isError) {
      setIsError(false);
      // }
    }

    if (isSort) {
      newValue = parseInt(newValue);
      if (newValue < 1) {
        return;
      }
    }

    // if(!isSort && !newValue){

    // }
    // if (!newValue) return;
    const existing = value.find(
      (item) => item[isSort ? "metaObjectId" : "rename"] !== newValue
    );
    console.log("existingsds", existing.rename);

    // const toEdit = isSort ? "id" : "rename";
    if (existing) {
      setValue((prevValue) =>
        prevValue.map((method) =>
          method[isSort ? "metaObjectId" : "id"] === id
            ? { ...method, [isSort ? "sortId" : "rename"]: newValue }
            : // : method[isSort ? "metaObjectId" : "id"] === id &&
              //   method?.isAdditionalMethod
              // ? {
              //     ...method,
              //     [isSort ? "sortId" : "rename"]: newValue,

              //     ...(!isSort && {
              //       original: newValue,
              //     }),
              //   }
              method
        )
      );
    }
    // if (existing) {
    //   setValue((prevValue) =>
    //     prevValue.map((method) =>
    //       newValue && method[isSort ? "metaObjectId" : "id"] === id
    //         ? { ...method, [isSort ? "sortId" : "rename"]: newValue }
    //         : !newValue && method[isSort ? "metaObjectId" : "id"] === id
    //         ? { ...method, [isSort ? "sortId" : "rename"]: method.rename }
    //         : method
    //     )
    //   );
    // }
    //  else {
    //   const getOriginal = paymentMethods.find(
    //     (method) => method.value === existing.original
    //   );
    //   console.log("getOriginalid", id);
    //   setNewMethods((prevValue) =>
    //     prevValue.map((method) =>
    //       method.id === id ? { ...method, rename: newValue } : method
    //     )
    //   );
    //   // setNewMethods((prev) => [
    //   //   ...prev,
    //   //   { id, original: getOriginal.value, rename: newValue },
    //   // ]);
    // }
  };

  const changePaymentMethodSorting = async () => {
    try {
      // return;
      // const Id = await getPaymentCustomizationId(true);
      // console.log('check whats wrong', Id)
      if (!value) {
        setToastProps({
          content: `Please enter a name for the payment method to rename.`,
          error: true,
        });
        return;
      }
      // setIsLoadingThree(true);

      // let fetchIndex = paymentMethods.find(
      //   (method) => method.value === selected
      // );

      // if (!fetchIndex) {
      //   fetchIndex.index = 0;
      // }
      // console.log(
      //   "payment method changed",
      //   customizationIds[fetchIndex?.index ?? 0].node?.id?.split(
      //     "gid://shopify/PaymentCustomization/"
      //   )[1]
      // );
      // setIsLoading(false);
      // return;

      // if (
      //   !Id?.node?.id?.split(
      //     "gid://shopify/PaymentCustomization/"
      //   )[1]
      // ) {
      //   console.log("asass");
      //   setIsActivated(false);
      //   setIsLoadingTwo(false);
      //   return;
      // }
      let fusion;

      // Use filter to exclude objects with rename as null
      const filteredArray = newMethods.filter((item) => item.rename !== null);

      if (filteredArray.length === 0) {
        fusion = value;
      } else {
        fusion = [...value, ...newMethods];
      }

      console.log(
        "final input to sent sort payment",
        fusion,
        "customization id",
        customizationIds
      );
      // return;

      const response = await fetch("/api/sort_payment_method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionId: _shopifyFunctions[0].id,
          paymentMethodId: customizationIds
            .find((item) => item.node.title.includes("sortingPaymentMethods"))
            .node?.id?.split("gid://shopify/PaymentCustomization/")[1],
          // newName: value,
          // selected: !selected ? paymentMethods[0].value : selected,
          paymentMethodsToEdit: fusion,
        }),
      });
      const data = await response.json();
      console.log("success payment sorted", data);
      // if (!metaObjectId) {
      //   console.log("create hit");
      //   await createMetaObject();
      // } else {
      //   console.log("update hit");
      //   await updateMetaObject();
      // }
      // setPostPaymentMethodMetaObject(true);
      // setIsLoadingTwo(false);
      // setIsError(false);
      // handleChange("");
      // setToastProps({
      //   content: `Payment method sorted successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
    } catch (error) {
      setIsLoadingTwo(false);
      console.log(error);
    }
  };
  const changePaymentMethodName = async () => {
    try {
      // const Id = await getPaymentCustomizationId(true);
      // console.log('check whats wrong', Id)
      if (!value) {
        setToastProps({
          content: `Please enter a name for the payment method to rename.`,
          error: true,
        });
        return;
      }
      setIsLoadingTwo(true);

      // let fetchIndex = paymentMethods.find(
      //   (method) => method.value === selected
      // );

      // if (!fetchIndex) {
      //   fetchIndex.index = 0;
      // }
      // console.log(
      //   "payment method changed",
      //   customizationIds[fetchIndex?.index ?? 0].node?.id?.split(
      //     "gid://shopify/PaymentCustomization/"
      //   )[1]
      // );
      // setIsLoading(false);
      // return;

      // if (
      //   !customizationIds[fetchIndex?.index ?? 0]?.node?.id?.split(
      //     "gid://shopify/PaymentCustomization/"
      //   )[1]
      // ) {
      //   console.log("asass");
      //   setIsActivated(false);
      //   setIsLoadingTwo(false);
      //   return;
      // }
      // let fusion;

      // Use filter to exclude objects with rename as null
      const filteredArray = newMethods.filter((item) => item.rename !== null);
      // if (filteredArray.length === 0) {

      //   fusion = value;
      // } else {
      //   fusion = [...value, ...newMethod];
      // }

      if (newMethod?.original && newMethod?.rename) {
        value.push(newMethod);
        // fusion = value;
      }
      console.log("lengthe", value);
      // console.log("lengthe", fusion, _shopifyFunctions[1], customizationIds.find((item) => item.node.title.includes("payment-customization")));
      // return;
      const response = await fetch("/api/rename_payment_method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionId: _shopifyFunctions[1].id,
          paymentMethodId: customizationIds
            .find((item) => item.node.title.includes("payment-customization"))
            .node?.id?.split("gid://shopify/PaymentCustomization/")[1],
          // newName: value,
          // selected: !selected ? paymentMethods[0].value : selected,
          paymentMethodsToEdit: value,
        }),
      });
      const data = await response.json();
      console.log("success payment rename", data);
      // if (!metaObjectId) {
      //   console.log("create hit");
      //   await createMetaObject();
      // } else {
      //   console.log("update hit");
      //   await updateMetaObject();
      // }
    } catch (error) {
      setIsLoadingTwo(false);
      console.log(error);
    }
  };
  // console.log("meta object id", metaObjectId);

  const createMetaObject = async (
    original,
    rename,
    sortId,
    isAdditionalMethod = false
  ) => {
    try {
      if (!isFetched) {
        setIsFetched(true);
      }
      const response = await fetch("/api/addMetaObject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orignal_name: original,
          customized_name: rename,
          type: META_OBJECT_TYPE,
          sortId,
          isAdditionalMethod,
        }),
      });
      const data = await response.json();
      console.log("metaobject  created", data);
      if (data.response.body.data.metaobjectCreate.userErrors.length > 0) {
        return false;
      }

      setToastProps({
        content: `metaobject from fresh schema created`,
        onDismiss: () => setToastProps(emptyToastProps),
      });

      return true;
    } catch (error) {
      setIsFetched(false);
      console.log(error);
      return false;
    }
  };
  const createMetaObjectSchema = async () => {
    try {
      if (!isFetched) {
        setIsFetched(true);
      }
      const response = await fetch("/api/createMetaObjectDefinition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type_two: META_OBJECT_KEY_TWO,
          type: META_OBJECT_TYPE,
          key: META_OBJECT_KEY,
          name: FIELD_NAME,
          rename: FIELD_RENAME_NAME,
          dataType: FIELD_TYPE,
          isAdditionalMethod,
        }),
      });
      const data = await response.json();
      console.log("metaobject schema created", data);
      if (
        data?.response?.body?.data?.metaobjectDefinitionCreate?.userErrors
          ?.length > 0
      ) {
        console.log(
          "error create schema deinition.",

          data?.response?.body?.data?.metaobjectDefinitionCreate?.userErrors
        );

        if (
          data?.response?.body?.data?.metaobjectDefinitionCreate?.userErrors.find(
            (item) => item.message.includes("Type has already been taken")
          )
        ) {
          return { status: false, message: "exist" };

          // let length = value.length + newMethods.length;
          // // console.log(
          // //   "condition triggering?",
          // //   "length of value and new methods",
          // //   length,
          // //   "length of payment methods all original",
          // //   paymentMethods.length,
          // //   "is fetched should be false",
          // //   isFetched
          // // );

          // if (!isFetched && length !== paymentMethods.length) {
          //   setNewMethods([]);
          // }
        }
        // shopify.toast.show("something went wrong creating cities model contact developer")
        // setToastProps({
        //   content: `Something went wrong creating metaobject definition contact developer`,
        //   onDismiss: () => setToastProps(emptyToastProps),
        // });
        // handleCreateMetaObjectDefinition();
        setToastProps({
          content: `error create schema deinition`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        // return false;
        return { status: false, message: null };
      }
      setToastProps({
        content: `schema created`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      await fetchData();

      return { status: true, message: "schema created" };
    } catch (error) {
      setIsFetched(false);

      console.log("cannot create schema", error);
      return false;
    }
  };
  const updateMetaObject = async (methodName) => {
    try {
      let metaObject = value.find((method) => method.original === methodName);

      if (!metaObject) return;
      const response = await fetch("/api/updateMetaObject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: metaObject.metaObjectId,
          customized_name: metaObject.rename,
          sortId: metaObject.sortId,
        }),
      });
      const data = await response.json();
      console.log("metaobject updated", data);
    } catch (error) {
      console.log("updatedMetaObject error", error);
    }
  };
  const getShopifyFunctions = async () => {
    try {
      const response = await fetch("/api/shopifyFunctions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("shopify functions fetched", data);
      const filteration = data.response.body.data.shopifyFunctions.nodes.filter(
        (_function) => _function.title !== "retrieve-payment-methods"
      );
      console.log("success payment methods retreived", filteration);
      setShopifyFunctions(filteration);
    } catch (error) {
      console.error(error.message);
    }
  };
  const getPaymentCustomizationId = async () => {
    try {
      const response = await fetch(`/api/paymentCustomizationId`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      console.log("payment customization ids retreived", data.response);

      // if (isReturn) {
      //   return data.response
      // } else {
      setCustomizationIds(data.response);
      // }
      // setShopifyFunctions(filteration);
    } catch (error) {
      console.error(error.message);
    }
  };
  const getPaymentMethodsName = async () => {
    try {
      setLoader(true);
      const response = await fetch("/api/paymentMethodsName", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      console.log("payment method names retreived", data);
      const filtered = data.response.map((item, index) => {
        return {
          value: item.translatableContent[0].value,
          label: item.translatableContent[0].value,
          index: index,
        };
      });
      setPaymentMethods(filtered);
      // setCustomizationId(
      //   data.response?.node?.id?.split("gid://shopify/PaymentCustomization/")[1]
      // );
      // setShopifyFunctions(filteration);
      // getMetaObjects();
      setLoader(false);
    } catch (error) {
      setLoader(false);

      console.error(error.message);
    }
  };
  const hasDuplicatePropertyValues = (array, property) => {
    const seenValues = new Set();

    for (const obj of array) {
      if (obj[property]) {
        if (seenValues.has(obj[property])) {
          return true; // Duplicate found
        }
        seenValues.add(obj[property]);
      }
    }
    return false; // No duplicates found
  };

  const getMetaObjects = async () => {
    try {
      //
      // const param = input;
      const response = await fetch(
        `/api/getMetaObject?type=${META_OBJECT_TYPE}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("recieving metaobjects in bulk", data);
      if (data.response.metaobjects.nodes.length === 0) {
        // if (!check) {
        // const isCreated = await createMetaObject(
        //   input,
        //   input,
        //   index + 1,
        //   false
        // );
        // if (!isCreated) {

        const isSchemaCreated = await createMetaObjectSchema();
        if (isSchemaCreated.status) {
          fetchData();
          // await getMetaObjects(method.value, index);
        } else {
          for (const [index, method] of paymentMethods.entries()) {
            // Remove whitespace & brackets from method string
            const normalizedMethod = method.value.replace(/\s+|\(.*?\)/g, "");

            // const check = data.response.metaobjects.nodes.find((_method) => {
            //   const originalValue = _method.original_name?.value || "";
            //   const normalizedOriginal = originalValue.replace(/\s+|\(.*?\)/g, "");
            //   return normalizedOriginal === normalizedMethod;
            // });

            console.log("check:", normalizedMethod);

            // if (!check) {
            const isCreated = await createMetaObject(
              method.value, // original_name
              normalizedMethod, // rename_value (change if needed)
              index + 1, // sortid
              false
            );
            console.log("created?", isCreated);
            // }
          }
          fetchData();
        }

        // reutrn;
        // // }
        // else {
        //   fetchData();
        // }
        // fetchData();
        // }
        return;
        const { status, message } = await createMetaObjectSchema();
        if (!status && message.includes("exist")) {
          // return false;
          await createMetaObject(input, input, index);
          await getMetaObjects(input, sortId);
          const obj = {
            sortId: index,
            id: index,
            original: input,
            rename: null,
          };

          setNewMethods((prev) => {
            const exists = prev.some((item) => item.original === obj.original);
            if (!exists) {
              return [...prev, obj];
            }
            return prev;
          });
          return;
        }
        return;

        // return;

        // setMetaObjectId(null);
        setIsMetaObjectsLoaded(false);
        return resolve();
      }

      // console.log("data", data);
      // return;
      // const value = data.response.fields[0].value.toLowerCase();
      // const inputLower = input.toLowerCase();
      // // Check if any character in `inputLower` exists in `value`
      // const hasMatchingChar = inputLower
      //   .split("")
      //   .some((char) => value.includes(char));
      // const getFieldValue = (key) =>
      //   data.response.metaobjects.nodes.find((field) => field.key === key)?.value;
      const methods = paymentMethods.map((item) =>
        item.value.toLowerCase().replace(/[^a-zA-Z]/g, "")
      );

      for (const [index, method] of paymentMethods.entries()) {
        // Remove whitespace & brackets from method string
        const normalizedMethod = method.value
          .toLowerCase()
          .replace(/[^a-zA-Z]/g, "");

        const check = data.response.metaobjects.nodes.find((_method) => {
          const originalValue = _method.original_name?.value || "";
          const normalizedOriginal = originalValue
            .toLowerCase()
            .replace(/[^a-zA-Z]/g, "");
          return normalizedOriginal === normalizedMethod;
        });

        console.log("check:", check, normalizedMethod);

        if (!check) {
          const isCreated = await createMetaObject(
            method.value, // original_name
            normalizedMethod, // rename_value (change if needed)
            index + 1, // sortid
            false
          );
          console.log("created?", isCreated);
          fetchData();
        }
      }

      const finalAllMetaObjects = data.response.metaobjects.nodes
        .filter(
          (check) =>
            methods.includes(
              check.original_name.value.toLowerCase().replace(/[^a-zA-Z]/g, "")
            ) || check?.isAdditionalMethod?.value === "true"
        )
        .map((item, index) => {
          return {
            sortId: item?.sortid?.value
              ? parseInt(item?.sortid?.value)
              : index + 1,
            id: index + 1,
            original: item.original_name.value,
            rename: item.rename_value.value,
            metaObjectId: item.id?.split("gid://shopify/Metaobject/")[1],
            isAdditionalMethod: item?.isAdditionalMethod?.value
              ? item?.isAdditionalMethod?.value
              : false,
          };
        });
      // const newObject = {
      //   sortId: getFieldValue("sortid")
      //     ? parseInt(getFieldValue("sortid"))
      //     : index + 1,
      //   id: index + 1,
      //   original: hasMatchingChar ? input : data.response.fields[0].value,
      //   rename: data.response.fields[1].value,
      //   metaObjectId: data.response.id?.split("gid://shopify/Metaobject/")[1],
      //   isAdditionalMethod: false,
      // };

      console.log("inspecion", finalAllMetaObjects, paymentMethods);

      // setMetaObjectId((prev) => [
      //   ...prev,
      //   {
      //     id: data.response.id?.split(
      //       "gid://shopify/PaymentCustomization/"
      //     )[1],
      //     original: hasMatchingChar ? input : data.response.fields[0].value,
      //     rename: hasMatchingChar ? input : data.response.fields[1].value,
      //   },
      // ]);
      // setValue((prev) => {
      //   const exists = prev.some(
      //     (item) => item.original === newObject.original && hasMatchingChar
      //   );
      //   if (!exists) {
      //     return [...prev, newObject];
      //   }
      //   return prev;
      // });
      setValue(finalAllMetaObjects);
      // setToastProps({
      //   content: `metaobject fetched`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      // resolve();
      return true;
    } catch (error) {
      console.error(error);
      return false;
      reject(error);
    }
  };
  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const handleChangeNewMethod = (val, isOriginal = false) => {
    setNewMethod((prev) => ({
      ...prev,
      isAdditionalMethod: true,
      id: value.length + 1,
      sortId: value.length + 1,
      [isOriginal ? "original" : "rename"]: val,
    }));
  };

  const handleConfirm = async (rename) => {
    try {
      if (rename) {
        if (!(_shopifyFunctions[1]?.title || _shopifyFunctions[0]?.title))
          return;
        setIsLoading(true);
      }

      const search = rename ? "payment-customization" : "sortingPaymentMethods";
      const _function = _shopifyFunctions.find((item) => item.title === search);
      console.log("why id underfined??", _shopifyFunctions);

      if (!_function) {
        console.log("function id and title not found.");
        return;
      }

      const response = await fetch("/api/customizePaymentMethod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          functionId: _function.id,
          functionName: _function.title,
        }),
      });
      const data = await response.json();
      console.log("success activating function", data);
      // toggleActive();

      if (rename) {
        if (
          data?.response?.body?.data?.paymentCustomizationCreate?.userErrors
            ?.length > 0
        ) {
          setToastProps({
            content:
              data.response.body.data.paymentCustomizationCreate.userErrors[0]
                .message,
            onDismiss: () => setToastProps(emptyToastProps),
          });
        } else {
          setToastProps({
            content: `Payment / sorting customization activated successfully`,
            onDismiss: () => setToastProps(emptyToastProps),
          });
        }

        getPaymentCustomizationId();
      }
      // else{
      //   return
      // }
      setIsLoading(false);
      setSelected("");
      setIsActivated(true);
    } catch (error) {
      setToastProps({
        content: error.message,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      console.log("error", error);
      setIsLoading(false);
    }
  };
  const fetchData = async () => {
    try {
      setIsFetched(true);

      // for (const [index, method] of paymentMethods.entries()) {
      //   const check = await getMetaObjects(method.value, index);
      //   if (!check) {
      //     const isCreated = await createMetaObject(method.value, method.value, index);
      //     if (!isCreated) {
      //       const isSchemaCreated = await createMetaObjectSchema();
      //       if (isSchemaCreated) {
      //         fetchData();
      //         // await getMetaObjects(method.value, index);
      //       }
      //     }
      //     // fetchData();
      //   }
      // }

      // const promises = paymentMethods.map((method, index) =>
      //   getMetaObjects(method.value, index)
      // );
      // await Promise.all(promises);
      await getMetaObjects();

      setPopulate(true);
      setIsFetched(false);
      if (isDelete) {
        setIsDelete(false);
      }
      console.log("All API calls completed in order.");
      // setToastProps({
      //   content: `All API calls completed in order`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
    } catch (error) {
      setPopulate(true);
      setIsFetched(false);
      console.error("Error in fetching data:", error);
    }
  };
  const UpdateData = async () => {
    try {
      setToastProps({
        content: `Don't Close this window or switch to another page. We're saving your changes. This may take a few seconds.`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      // Sequentially process each payment method
      for (const [index, method] of value.entries()) {
        // console.log("zors", method);
        await updateMetaObject(method.original);

        const check = newMethods.find(
          (_method) =>
            _method.original === method.value &&
            (_method.rename !== null || _method.rename !== "")
        );
        console.log(
          "check",
          check,
          "method.original",
          method.original,
          "index",
          index
        );
        if (check) {
          const isCreated = await createMetaObject(
            check.original,
            check.rename,
            index + 1,
            false
          );
          if (!isCreated) {
            const isSchemaCreated = await createMetaObjectSchema();
            if (isSchemaCreated) {
              await createMetaObject(
                check.original,
                check.rename,
                index + 1,
                false
              );
            }
          }
          fetchData();
        }
      }
      setPostPaymentMethodMetaObject(false);
      setPopulate(true);
      setToastProps({
        content: `Changes saved successfully`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
    } catch (error) {
      console.error("Error updating meta objects:", error);
    }
  };

  const handlePaymentUpdate = async () => {
    // return;
    try {
      setNewMethod({
        isAdditionalMethod: true,
        id: value.length + 1,
        sortId: value.length + 1,
        rename: "",
        original: "",
      });
      if (!isLoadingTwo && !isDelete) {
        setIsLoadingTwo(true);
      }

      if (
        value.some((item, index) => {
          return (
            value.findIndex((el) => el.sortId === item.sortId) !== index ||
            item.sortId > value.length
          );
        })
      ) {
        setToastProps({
          content: `Duplicates not allowed AND 1 to ${value.length} are allowed as sort number`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        setIsLoadingTwo(false);
        return;
      }
      // setIsLoadingThree(true);

      // Run first: Change name
      await changePaymentMethodName();

      // Run second: Change sort
      await changePaymentMethodSorting();

      // setToastProps({
      //   content: `Payment method changed successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      UpdateData();

      setToastProps({
        content: `Both rename and sort updated successfully`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
    } catch (error) {
      console.error("Error in handlePaymentUpdate:", error);
      setToastProps({
        content: `Something went wrong while updating payments`,
        error: true,
      });
    } finally {
      setIsLoadingTwo(false);
      setIsError(false);
      // handleChange(""); // setIsLoadingThree(false);
    }
  };

  const handleAddNewMethod = async () => {
    setIsAddNew(true);
    const isCreated = await createMetaObject(
      newMethod.original,
      newMethod.rename,
      newMethod.sortId,
      newMethod.isAdditionalMethod
    );
    if (isCreated) {
      // console.log("Before Add:", value);
      // console.log("newMethod:", newMethod);

      // setValue((prev) => {
      //   const updated = [...prev, newMethod];
      //   // console.log("After Add:", updated);
      //   return updated;
      // });
      // setValue((prev) => [...prev, newMethod]);
      await handlePaymentUpdate();
      await getPaymentMethodsName();
      setIsAddNew(false);
      setIsModalOpen(false);
      // getPaymentMethodsName();
    } else {
      setIsAddNew(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id); // start loading for this specific item

      setIsDelete(true);
      // console.log("yos", id, value);

      // setValue(filteredPaymentMethods);
      // console.log(
      //   "yos",
      //   value.map((method) =>
      //     method.metaObjectId === id
      //       ? { ...method, rename: filteredPaymentMethods.original }
      //       : method
      //   )
      // );
      // return;

      //upon step 02 success, run delete metaobject api
      const response = await fetch(`/api/deleteMetaObject?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("success payment method metaobject delete", data);

      // setIsDelete(false)
      //remove that id's object from value state
      const updated = value.map((v) =>
        v.metaObjectId === id ? { ...v, rename: v.original } : v
      );

      setValue(updated); // schedule UI update
    } catch (error) {
      setDeletingId(null); // clear after done

      console.log("error metaobject delete");
    }
  };

  useEffect(() => {
    fetchData();
  }, [paymentMethods]);

  // useEffect(() => {
  //   if (postPaymentMethodMetaObject) {
  //     UpdateData();
  //   }
  // }, [postPaymentMethodMetaObject]);

  useEffect(() => {
    // changePaymentMethodName();
    getPaymentMethodsName();
    getPaymentCustomizationId();
    getShopifyFunctions();

    if (getNonMetaObjects > -1) {
      setNonMetaObjects(paymentMethods.length - value.length);
    }
  }, []);

  // useEffect(() => {
  //   let length = value.length + newMethods.length;
  //   // console.log(
  //   //   "condition triggering?",
  //   //   "length of value and new methods",
  //   //   length,
  //   //   "length of payment methods all original",
  //   //   paymentMethods.length,
  //   //   "is fetched should be false",
  //   //   isFetched
  //   // );

  //   if (!isFetched && length !== paymentMethods.length) {
  //     setNewMethods([]);
  //   }
  // }, [value, newMethods, isFetched]);

  useEffect(() => {
    const runConfirm = async () => {
      if (customizationIds?.length === 0) {
        await Promise.all([
          Promise.resolve(handleConfirm(true)),
          Promise.resolve(handleConfirm(false)),
        ]);
      }
    };

    runConfirm();
  }, [customizationIds]);

  useEffect(() => {
    if (isDelete) {
      //run sort/rename api again
      handlePaymentUpdate();

      //run fetch() function again to get fresh data.
      fetchData();
    }
  }, [value]);

  // console.log("newMethods", newMethods, "value", value);
  console.log("value", newMethod);
  return (
    <Page
      // backAction={{ content: "Products", url: "#" }}
      title="Payment Customization"
      // titleMetadata={
      //   <Badge status={isActive ? "success" : "critical"}>
      //     {isActive ? "Active" : "Not Active"}
      //   </Badge>
      // }
      // subtitle="Sort number already used at checkout, You’ve set a sort number (e.g., 6) for a payment method in this app. But that position is already taken by another payment method that exists at checkout but isn’t currently listed in your customization list here (possibly added separately or not yet configured). Please choose a different sort number that is not already being used at checkout."
      compactTitle
      primaryAction={{
        content: "Add Payment Method",
        disabled: false,
        icon: AddMajor,
        onAction: () => {
          if (isModalOpen) return;
          setNewMethod({
            isAdditionalMethod: true,
            id: value.length + 1,
            sortId: value.length + 1,
            rename: "",
            original: "",
          });
          setIsModalOpen(true);
        },
      }}
      // secondaryActions={[
      //   {
      //     content: "Duplicate",
      //     accessibilityLabel: "Secondary action label",
      //     onAction: () => alert("Duplicate action"),
      //   },
      //   {
      //     content: "View on your store",
      //     onAction: () => alert("View on your store action"),
      //   },
      // ]}
      // actionGroups={[
      //   {
      //     title: "Options",
      //     actions: [
      //       {
      //         content: "Rename payment methods",
      //         accessibilityLabel: "Individual action label",
      //         onAction: () => {
      //           // if (isSort) {
      //           //   setIsSort(false);
      //           // }
      //           // setIsRename(true);
      //           // setSelectedFuncitonId(_shopifyFunctions[1].id);
      //           // // getMetaObjects();
      //         },
      //       },
      //     ],
      //   },
      // ]}
      // pagination={{
      //   hasPrevious: true,
      //   hasNext: true,
      // }}
      fullWidth
    >
      <LegacyCard sectioned>
        <Text fontWeight="medium">
          <Text fontWeight="bold">NOTE:</Text> Assign a unique sort number to
          each payment method. Avoid duplicates—each sort number must not
          already be used at checkout, even by methods not listed here.
        </Text>
      </LegacyCard>
      <div
        style={{
          marginTop: "21px",
          display: "flex",
          gap: "15px",
        }}
      >
        {/* Main Functionalities i.e rename / sort payment methods */}
        <div style={{ width: "75%" }}>
          <LegacyCard sectioned>
            <Text fontWeight="medium" variant="headingLg">
              Payment Customization List:
            </Text>
            <div style={{ marginBottom: "12px" }} />
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              {value.length > 0 && (
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      Original Name
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      Rename
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "left",
                      }}
                    >
                      Sort ID
                    </th>
                  </tr>
                </thead>
              )}

              <tbody>
                {value.length > 0 ? (
                  value
                    ?.sort((a, b) => a.id - b.id)
                    .map((method, index) => {
                      const currentRename = method.rename;
                      const currentSortId = method.sortId;
                      const isDuplicate = value.find(
                        (m, i) => i !== index && m.sortId === currentSortId
                      );

                      const isSortExceed =
                        currentSortId && currentSortId > value.length;
                      // console.log("checking", method);
                      return (
                        <tr key={index}>
                          <td
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            {method.original}
                          </td>
                          <td
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            <TextField
                              value={currentRename || ""}
                              onChange={(val) =>
                                handleChange(
                                  val,
                                  method.id,
                                  false,
                                  isSortExceed,
                                  index
                                )
                              }
                              placeholder="Rename method"
                              autoComplete="off"
                              disabled={isSorted || isDelete}
                              error={!currentRename ? "Can't be empty" : ""}
                            />
                          </td>
                          <td
                            style={{ border: "1px solid #ccc", padding: "8px" }}
                          >
                            <TextField
                              type="number"
                              value={currentSortId || ""}
                              onChange={(val) =>
                                handleChange(
                                  val,
                                  method.metaObjectId,
                                  true,
                                  isSortExceed,
                                  index
                                )
                              }
                              placeholder="Sort ID"
                              autoComplete="off"
                              error={
                                !currentSortId
                                  ? "Can't be empty"
                                  : isDuplicate
                                  ? "Duplicate not allowed"
                                  : isSortExceed
                                  ? `Only 1 to ${value.length} allowed`
                                  : ""
                              }
                              disabled={isDelete}
                            />
                          </td>
                          {method.isAdditionalMethod === "true" && (
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              <Button
                                loading={deletingId === method.metaObjectId}
                                icon={DeleteMinor}
                                tone="critical"
                                onClick={() =>
                                  handleDelete(method.metaObjectId)
                                }
                                plain
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })
                ) : !isFetched && value.length === 0 ? (
                  <EmptyState
                    heading="No Payment Methods Customization Found"
                    action={{
                      content: "Rename Additional Payment Method",
                      onAction: () => {
                        if (isModalOpen) return;
                        setNewMethod({
                          isAdditionalMethod: true,
                          id: value.length + 1,
                          sortId: value.length + 1,
                          rename: "",
                          original: "",
                        });
                        setIsModalOpen(true);
                      },
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    fullWidth
                  >
                    <p>
                      There is no manual payment methods detected to populate.
                      either add them via admin settings or Rename Additional
                      Payment Method using below button.
                    </p>
                  </EmptyState>
                ) : (
                  <tr>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />

                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                      <SkeletonDisplayText size="large" />

                      <div style={{ marginTop: "10px" }} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 100px)',
            gap: '10px',
            padding: '10px'
          }}
        >

          {customizationIds?.length !== 0 && paymentMethods?.length !== 0 ? (
            <div >
              {/* <Select
            // label="Select a original payment method to rename"
            options={paymentMethods}
            onChange={handleSelectChange}
            value={selected}
          /> */}
            {/* <List type="number">
                {paymentMethods.map((method) => {
                  return (
                    <>
                      <div style={{ paddingTop: 6 }} />
                      <List.Item key={method.value}>{method.label}</List.Item>
                      <div style={{ paddingBottom: 12 }} />
                    </>
                  );
                })}
              </List>
            </div> */}
            {/* ) : loader ? (
            "loading original names"
          ) : (
            <div
              style={{
                alignContent: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              <Icon source={CircleAlertMajor} />
              <div style={{ marginTop: 10 }} />
              No Payment Methods Found
            </div>
          )} */}

            {/* RENAMING Payment Method Name */}

            {/* <div>
            {(isRename !== null || isSorted !== null) && (
              <>
                {!isLoading &&
                  customizationIds?.length !== 0 &&
                  paymentMethods?.length !== 0 &&
                  !isFetched ? (
                  <>
                    {populate &&
                      value &&
                      value
                        .sort((a, b) => a.id - b.id)
                        .map((method, index) => {
                          const currentValue = method.rename;

                          return (
                            <div key={index}>
                              <TextField
                                disabled={isSorted ? true : false}
                                placeholder={
                                  isMetaObjectsLoaded
                                    ? "Loading previously customized method name if had..."
                                    : "Enter new payment method name here..."
                                }
                                value={method.rename || ""} // Display the value of the key
                                onChange={(val) => handleChange(val, method.id)} // Pass method.id for a more unique identifier
                                autoComplete="off"
                                error={
                                  !currentValue
                                    ? "Can't be empty"
                                    : ""
                                }
                              />
                              <div style={{ marginBottom: 10 }} />
                            </div>
                          );
                        })}
                    {newMethods.length !== 0 &&
                      newMethods
                        .sort((a, b) => a.id - b.id)
                        .map((method, index) => {
                          console.log("method", method.id);
                          return (
                            <div key={index}>
                              <TextField
                                disabled={isSorted ? true : false}
                                placeholder={
                                  isMetaObjectsLoaded
                                    ? "Loading previously customized method name if had..."
                                    : "Enter new payment method name here..."
                                }
                                value={method.rename || ""} // Display the value of the key
                                onChange={(val) =>
                                  handleChangeNonMetaObj(val, method.id)
                                } // Pass method.id for a more unique identifier
                                autoComplete="off"
                              />
                              <div style={{ marginBottom: 10 }} />
                            </div>
                          );
                        })}
                    <Button
                      disabled={isError || isSorted ? true : false}
                      loading={isLoadingTwo}
                      variant="primary"
                      onClick={changePaymentMethodName}
                    >
                      Confirm
                    </Button>
                  </>
                ) : (
                  "loading customizable names"
                )}
              </>
            )}
          </div> */}

            {/* SORTING Payment Method Name */}
            {/* <div >
            {!isRename && isSorted !== null && (
              <>
                {!isLoading &&
                  customizationIds?.length !== 0 &&
                  paymentMethods?.length !== 0 &&
                  !isFetched ? (
                  <>
                    {populate &&
                      value &&
                      value
                        .sort((a, b) => a.id - b.id)
                        .map((method, index) => {
                          const currentValue = method.sortId;
                          const isDuplicate = value.filter(
                            (m, i) => i !== index && m.sortId === currentValue
                          ).length > 0;
                          const isSortExceed = currentValue && currentValue > value.length;
                          return (
                            <div key={index}>
                              <TextField
                                type="number"
                                // disabled={isSorted ? true : false}
                                placeholder={
                                  isMetaObjectsLoaded
                                    ? "Loading previously customized method id if had..."
                                    : "Enter new payment method id here..."
                                }
                                value={method.sortId || ""} // Display the value of the key
                                onChange={(val) => handleChange(val, method.metaObjectId, isDuplicate ? true : false)} // Pass method.id for a more unique identifier
                                autoComplete="off"
                                error={
                                  !currentValue
                                    ? "Can't be empty"
                                    : isDuplicate
                                      ? "Duplicate not allowed"
                                      : isSortExceed
                                        ? `Only 1 to ${value.length} allowed`
                                        : ""
                                } />
                              <div style={{ marginBottom: 10 }} />
                            </div>
                          );
                        })}
                    {newMethods.length !== 0 &&
                      newMethods
                        .sort((a, b) => a.id - b.id)
                        .map((method, index) => {
                          const currentValue = method.sortId;
                          const isDuplicate = value.filter(
                            (m, i) => i !== index && m.sortId === currentValue
                          ).length > 0;
                          return (
                            <div key={index}>
                              <TextField
                                type="number"
                                // disabled={isSorted ? true : false}
                                placeholder={
                                  isMetaObjectsLoaded
                                    ? "Loading previously customized method id if had..."
                                    : "Enter new payment method id here..."
                                }
                                value={method.sortId || ""} // Display the value of the key
                                onChange={(val) =>
                                  handleChangeNonMetaObj(val, method.metaObjectId)
                                } // Pass method.id for a more unique identifier
                                autoComplete="off"
                                error={
                                  !currentValue
                                    ? "Can't be empty"
                                    : isDuplicate
                                      ? "Duplicate not allowed"
                                      : ""
                                }
                              />
                              <div style={{ marginBottom: 10 }} />
                            </div>
                          );
                        })}
                    <Button
                      disabled={isError ? true : false}
                      loading={isLoadingThree}
                      variant="primary"
                      onClick={changePaymentMethodSorting}
                    >
                      Confirm
                    </Button>
                  </>
                ) : (
                  "Loading sorting order"
                )}
              </>
            )}
          </div>
        </div>  */}
          </LegacyCard>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "30px",
            }}
          >
            <Button
              disabled={
                !isError && !isDelete && isAppLoad
                  ? true
                  : isError
                  ? true
                  : isDelete
                  ? true
                  : false
              }
              loading={
                isDelete && isLoadingTwo
                  ? false
                  : !isDelete && isLoadingTwo
                  ? true
                  : false
              }
              primary
              onClick={handlePaymentUpdate}
            >
              Save
            </Button>
          </div>
        </div>

        {/* INFO PAGE */}

        <div
          style={{
            width: "25%",
            height: "40%",
            maxHeight: "896px",
            // flex: 1,
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #FFFFFF",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
            // position: "fixed",
            // alignContent: "flex-end",
            // alignSelf: "self-end", // Ensure it stays at the top
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Summary
          </span>

          <div
            style={{
              marginTop: 10,
              marginBottom: 20,
              fontSize: "13px",
              color: "gray",
              fontWeight: "500",
            }}
          >
            Manage the display order and names of payment methods at checkout.
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Type and method
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "flex-start" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem("New Point")}>Add Point</button> */}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Rules & Constraints
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items_two.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "flex-start" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem_two("New Point")}>Add Point</button> */}
          </div>
        </div>
      </div>

      {toastMarkup}

      <AppProvider>
        {/* <Frame> */}
        <Modal
          // activator={activator}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add payment method"
          primaryAction={{
            content: "save",
            onAction: () => handleAddNewMethod(),
            icon: AddMajor,
            loading: isAddNew,
            // destructive: true,
            disabled: newMethod?.original && newMethod?.rename ? false : true,
            // loading: loading
          }}
          // secondaryActions={[
          //   {
          //     content: 'Learn more',
          //     onAction: handleChange,
          //
          // ]}
        >
          <Modal.Section>
            <TextField
              label="Enter original name"
              value={newMethod.original || ""}
              onChange={(val) => handleChangeNewMethod(val, true)}
              placeholder="original method"
              autoComplete="off"
              // disabled={isSorted}
              // error={!currentRename ? "Can't be empty" : ""}
            />
            <div style={{ marginTop: "20px" }} />
            <TextField
              label="Enter rename"
              value={newMethod.rename || ""}
              onChange={(val) => handleChangeNewMethod(val, false)}
              placeholder="Rename method"
              autoComplete="off"
              // disabled={isSorted
              // error={!currentRename ? "Can't be empty" : ""}
            />
          </Modal.Section>
        </Modal>
        {/* </Frame> */}
        {/* {toastMarkup} */}
      </AppProvider>
    </Page>
  );
}
