import { useCallback, useEffect, useState } from "react";
import {
  Card,
  TextContainer,
  Text,
  Page,
  TextField,
  Toast,
  Frame,
  Button,
  ButtonGroup,
  AlphaCard,
  VerticalStack,
  CalloutCard,
  Spinner,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../hooks";

export default function Checkout_City() {
  const fetch = useAuthenticatedFetch();
  const META_OBJECT_TYPE = "city__",
    PREV_META_OBJECT_TYPE = "city_ad",
    META_OBJECT_KEY = "cities",
    FIELD_NAME = "Cities",
    FIELD_TYPE = "json";
  let DEFAULT_CITIES = `{\"countries\":[
            {\"name\": \"United States\", \"code\": \"US\", \"cities\": [\"New York\", \"Los Angeles\", \"Chicago\", \"Houston\", \"Miami\"]},
            {\"name\": \"Canada\", \"code\": \"CA\", \"cities\": [\"Toronto\", \"Vancouver\", \"Montreal\", \"Calgary\", \"Ottawa\"]},
            {\"name\": \"United Kingdom\", \"code\": \"GB\", \"cities\": [\"London\", \"Manchester\", \"Birmingham\", \"Liverpool\", \"Glasgow\"]},
            {\"name\": \"Australia\", \"code\": \"AU\", \"cities\": [\"Sydney\", \"Melbourne\", \"Brisbane\", \"Perth\", \"Adelaide\"]},
            {\"name\": \"Germany\", \"code\": \"DE\", \"cities\": [\"Berlin\", \"Hamburg\", \"Munich\", \"Cologne\", \"Frankfurt\"]},
            {\"name\": \"Pakistan\", \"code\": \"PK\", \"cities\": []},
            {\"name\": \"India\", \"code\": \"IN\", \"cities\": [\"Mumbai\", \"Delhi\", \"Bangalore\", \"Chennai\", \"Kolkata\"]},
            {\"name\": \"France\", \"code\": \"FR\", \"cities\": [\"Paris\", \"Marseille\", \"Lyon\", \"Toulouse\", \"Nice\"]}
          ]}`;
  const [selectedCountry, setSelectedCountry] = useState("Pakistan");
  let DEFAULT_CITIES_PAKISTAN = `Badin,Bhiria City,Bhiria Road,Dadu,Daulatpur,Digri,Dokri,Gambat,Garhi Yasin,Ghotki,Mirpur Mathelo,Daharki,Ubaro,Hyderabad,Islamkot,Jacobabad,Jamshoro,Kandhkot,Kandiaro,Karachi,Kashmore,Khadro,Khairpur,Khipro,Kotri,Larkana,Matiari,Mehar,Mirpur Khas,Mithi,Mehrabpur,Moro,Naudero,Nawabshah,Ranipur,Ratodero,Rohri,Sakrand,Sanghar,Sehwan Sharif,Shahdadkot,Shahdadpur,Shikarpaur,Sinjhoro,Sukkur,Tando Adam Khan,Tando Allahyar,Tando Muhammad Khan,Thatta,Umerkot,Warah,Piryaloi,Sita Road,Pir Jo Goth,Samaro,Khairpur Nathan Shah,Kunri,Thul,Arif Wala,Attock,Bahawalnagar,Bahawalpur,Bhakkar,Bhalwal,Burewala,Chakwal,Chiniot,Chishtian,Daska,Dera Ghazi Khan,Faisalabad,Gojra,Gujranwala,Gujranwala Cantonment,Gujrat,Hafizabad,Haroonabad,Hasilpur,Jaranwala,Jatoi,Jhang,Jhelum,Kamalia,Kamoke,Kasur,Khanewal,Khanpur,Khushab,Kot Abdul Malik,Kot Addu,Lahore,Layyah,Lodhran,Mandi Bahauddin,Mianwali,Multan,Muridke,Muzaffargarh,Narowal,Okara,Pakpattan,Rahim Yar Khan,Rawalpindi,Sadiqabad,Sahiwal,Sambrial,Samundri,Sargodha,Sheikhupura,Sialkot,Taxila,Vehari,Wah Cantonment,Wazirabad,Quetta,Turbat,Khuzdar,Hub,Chaman,Dera Murad Jamali,Gwadar,Dera Allah Yar,Usta Mohammad,Sui,Sibi,Loralai,Zhob,Kharan,Abbottabad,Bannu,Batkhela,Battagram,Chakdara,Charsadda,Chitral,Dargai,Dera Ismail Khan,Dir,Hangu,Haripur,Karak,Kohat,Lakki Marwat,Mansehra,Mardan,Mingora,Nowshera,Paharpur,Pabbi,Peshawar,Risalpur,Saidu Sharif,Shewa Adda,Swabi,Swat,Tangi,Tank,Thall,Timergara,Tordher,Islamabad ,Askole,Astore,Bunji (or Boanzhi),Chilas,Chillinji,Chiran,Gakuch,Ghangche,Ghizer,Gilgit,Dayor,Sultanabad - Gilgit,oshikhanda Gilgit,Jalalabad,Jutial Gilgit,Alyabad Hunza,Gorikot,Gulmit,Jaglot,Chalt (Nagar),Thole (Nagar),Nasir Abad,Mayoon,Khana Abad,Hussain Abad,Qasimabad Masoot (Nagar),Nagar Proper,Ghulmat (Nagar),Karimabad (Hunza),Ishkoman,Khaplu,Minimerg,Misgar,Passu,Shimshal,Skardu,Sust,Thowar,Kharmang,Roundo,Shigar Muhammad Amin,Shigar Bunpa,Shigar Kiahong,Muzaffarabad,Dadyal,Mirpur,Hatia Bala,Rawala Kot,Poonch,Kotli,Mangla,Dhirkot,Bagh,Hajira,Bhimbar,Palandri,Chak Swari,Athara Hazari,Abdul Hakim,Adda Bun Bosan,Adda Lar,Adda Machiwal,Adda Zakheera,Ahmed Pur Lamma,Ahmed Pur Sial,Ali Pur Chatta,Amberi Kalla,Aminpur Banglow,Awaran,Bajwar,Balakot,Banglow Gogera,Bari Kot,Barkhan,Barnala,Barnala A.K,Basir Pur,Bela,Bhai Pharu,Bhan Saeedabad,Bhawana,Bhera,Bhit Shah,Bucheki,Buchiana Mandi,Budhla Sant,Bunair,Chachro,Chak Jhumra,Chak Sawari,Changa Manga,Chani Goth,Chashma,Chawinda,Chenab Nagar,Chichawatni,Choa Syden Shah,Chor Cantt,Chowk Azam,Dharanwala,Dakota,Dalbandin,Dara Adm Khel,Darya Khan,Daud Khel,Daultala,Depal Pur,Dhadar,Dhanola,Dhanot,Dhodak,Dhoro Naro,Dijkot,Dina,Dinga,Dolat Nagar,Daur,Duki,Dulle Wala,Dunya Pur,Allahabad,Faqir Wali,Farooqabad,Fateh Jang,Fatehpur,Fazil Pur,Feroz Watowan,Feroza,Fort Abbas,Gadoon Amazai,Gaggo Mandi,Garh Mor,Gari Khairo,Ghakar,Gharo,Ghaziabad,Ghous Pur,Golarchi,Guddu,Gujarkhan,Hafizwala,Hala,Harnai,Harnoli,Hasan Abdal,Hatter,Haveli Lakha,Havelian,Hazro,Hujra Shamuqeem,Hunza,Iqbal Nagar,Iqbalabad,Iskandarabad,Isa Khel,Jalalpur Jattan,Jalalpurpirwala,Jamal Din Wali,Jampur,Jand Wala,Jarwar,Jawarian,Jhangira,Jhanian,Jhat Pat,Jhol,Jhudo,Johi,Jauharabad,Kabal,Kabir Wala,Kacha Kho,Kahuta,Kakul,Kala Bagh,Kala Shah Kaku,Kalar Kahar,Kallar Syedan,Kalaskay,Kalat,Kambar Ali Khan,Kamar Moshani,Kamra,Kana Nau,Kandh Kot,Kangan Pur,Karor Lalesan,Karor Pakka,Kassowal,Katlang,Khairpur Tamewali,Khan Bela,Khanqah Sharif,Kharian,Kharian Cantt,Khazakhela,Khewra Dandot,Khiderwala,Kanozai,Kohilu,Kot Chutta,Kot Ghulam Muhammad,Kot Mithan,Kot Momin,Kot Radha Kishan,Kot Samaba,Kotla Arab Ali Khan,Kotla Jam,Kotli-A.Kashmir,Kuchlak,Kundian,Lalamusa,Lalian,Landikotal,Liaquatpur,Luddan,Machi Goth,Mailsi,Makhdoom Aali,Malak Wal,Mamun Kanjan,Mandi Shah,Mangowal,Mankera,Mastung,Matli,Mehmood Kot,Mian Channu,Minchanabad,Mirpur Sakro,Mirwah Gorchani,Mityari,Mongi Bangla,Mor Khunda,Mubarak Pur,Muridwala,Murree,Muslim Bagh,Nankana Sahib,Narwala Bangla,Naushera,New Jatoi,New Saeedabad,Nooriabad,Noorpur,Noshki,Noshero Feroz,Nowshera Virkan,Noorpur Thal,Oghi,Okara Cantt,Pacca Chang,Paikhel,Painsra,Panjgoor,Pano Aqil,Pano Aqil Cantt,Pasni,Pasrur,Patoki (Lahore),Phalia,Pharianwali,Phularwan,Pindi Bhatian,Pindi Gheb,Piplan,Pir Mahal,Pishin,Pithoro,Qaboola,Qadirpur Rawan,Qalandarabad,Qazi Ahmed,Qila Dedarsingh,Qilla Saifullah,Quaidabad,Radhan Station,Raiwand,Rajana,Rajanpur,Rawat,Renala Khurd,Rodu Sultan,Sadhar,Samandri,Sanawan,Sandhilian Wali,Sangla Hill,Sarhari,Satiana Bangla,Sensa,Shabqadar,Shahkot,Shahpur,Shakar Garh,Sharaqpur,Shinkiari,Shorkot,Shujaabad,Sillanwali,Sorab,Sarai Alamgeer,Sujawal,Sundar Adda,Takht Bhai,Talagang,Tandlianwala,Tando Jam,Tarbela,Tatlay Aali,Tharo Shah,Tharri Mir Wah,Therhi,Tibba Sultan,Tobatek-Singh,Topi,Torkham,Uch Sharif,Upper Dir,Uthal,Vari Dir,Wan Bachran,Wando,Yazman Mandi,Zafarwal,Zahir Peer,Ziarat`;
  const PrevList = useRef("");
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState({ event: false, message: "" });
  const [isPopulating, setIsPopulating] = useState(false);
  const [checkSubscription, setCheckSubscription] = useState(false);
  const [url, setUrl] = useState(null);
  const productsCount = 5;
  const [value, setValue] = useState("");
  const [metaObjectId, setMetaObjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);
  const [isLoading, setIsLoading] = useState(true); // Simulate loading state
  const [dismiss, setDismiss] = useState(true); // Simulate loading state
  const [activeStep, setActiveStep] = useState(0); // Track active step
  const [allCountry, setAllCountry] = useState([]);
  const [allCountryCities, setAllCountryCities] = useState([]);

  const steps = [
    {
      title: "Step 01",
      loadingText: "Creating your schema...",
      completedText: "Schema already created",
    },
    {
      title: "Step 02",
      loadingText: "Processing data...",
      completedText: "Data processed",
    },
    {
      title: "Step 03",
      loadingText: "Finalizing setup...",
      completedText: "Setup complete",
    },
  ];

  const handleCountryChange = (_value) => {
    // console.log('checking', _value)
    setSelectedCountry(_value);

    let cities =
      value &&
      formatCities(value)
        .split(",")
        .map((val) => capitalizeAndTrim(val.trim()));

    const updatedCities = allCountryCities.map((country) =>
      country.name.includes(selectedCountry) && cities.length > 0
        ? { ...country, cities }
        : country
    );
    // console.log(
    //   "allCountryCities",
    //   allCountryCities,
    //   "updatedCities",
    //   updatedCities,
    //   "cities",
    //   cities
    // );

    setAllCountryCities(updatedCities);

    const getCurrentCountryCities = allCountryCities
      .find((country) =>
        country?.name
          ?.toLowerCase()
          .trim()
          .includes(_value?.toLowerCase().trim())
      )
      ?.cities.join(",");
    // console.log('dill', getCurrentCountryCities)
    setValue(getCurrentCountryCities);
  };

  // // Simulate loading completion
  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setIsLoading(false);
      setTimeout(() => {
        setActiveStep((prev) => prev + 1);
        setIsLoading(true); // Reset for next step
      }, 1000); // Delay to show completed state
      // setIsLoading(false)
    }
  };

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );
  const capitalizeAndTrim = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const handleChange = useCallback((newValue) => setValue(newValue), []);

  // const {
  //   data,
  //   refetch: refetchProductCount,
  //   isLoading: isLoadingCount,
  // } = useQuery({
  //   queryKey: ["productCount"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/products/count");
  //     return await response.json();
  //   },
  //   refetchOnWindowFocus: false,
  // });

  // const setPopulating = (flag) => {
  //   shopify.loading(flag);
  //   setIsPopulating(flag);
  // };

  // const handlePopulate = async () => {
  //   setPopulating(true);
  //   const response = await fetch("/api/products", { method: "POST" });

  //   if (response.ok) {
  //     await refetchProductCount();

  //     shopify.toast.show(
  //       t("ProductsCard.productsCreatedToast", { count: productsCount })
  //     );
  //   } else {
  //     shopify.toast.show(t("ProductsCard.errorCreatingProductsToast"), {
  //       isError: true,
  //     });
  //   }

  //   setPopulating(false);
  // };

  function formatCities(input) {
    if (!input) return ""; // Agar input empty hai to empty string return karein

    return input
      .split(/\s*,\s*|\s*\n\s*/g) // Split karein commas ya new lines pr, aur extra spaces hata dein
      .filter((city) => city.trim() !== "") // Empty elements hata dein
      .map((city) => city.trim().replace(/\s+/g, " ")) // Multiple spaces ko single space se replace karein
      .map((city) => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()) // Proper capitalization
      .join(","); // List ko dubara comma-separated bana dein
  }
  const delay = async () =>
    await new Promise((resolve) => setTimeout(resolve, 500)); // 5 seconds delay

  const handleUpdateMetaObjectCities = async () => {
    try {
      console.log("check", metaObjectId);
      if (!value || !metaObjectId) return;

      // // Validate input: must be a comma-separated list
      const cityRegex = /,/;
      if (!cityRegex.test(value.trim())) {
        setToastProps({
          content: `Input city name comma seperated, and names must be valid.`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        // shopify.toast.show(
        //   "Input city name comma seperated, and names must be valid.",
        // );
        return;
      }
      setLoading(true);

      // let list = "karachi, lahore, Islamabad, abbottabad";

      // if (value) {
      //   list = value; // This will only update if value is assigned
      // }

      // Convert to an array, capitalize, and trim spaces
      let cities = formatCities(value)
        .split(",")
        .map((val) => capitalizeAndTrim(val.trim()));

      // Format the final string with only newlines
      const updatedCities = allCountryCities.map((country) =>
        country.name
          .toLowerCase()
          .trim()
          .includes(selectedCountry.toLowerCase().trim())
          ? { ...country, cities }
          : country
      );

      let formattedString = JSON.stringify(
        { countries: updatedCities },
        null,
        2
      );

      // let cities = "karachi,lahore,Islamabad,abbottabad";
      // let cities = value.split(",").map((val) => capitalizeAndTrim(val));

      //send this below payload as an input into graphql api
      //metaobjects post
      // let formattedString = `\n\n${cities.join("\n\n")}\n\n`;

      // console.log('checkup', formattedString);
      // return;
      const response = await fetch("/api/updateMetaObjectCities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customized_name: `${formattedString}`,
          id: `${metaObjectId}`,
          key: META_OBJECT_KEY,
        }),
      });
      const data = await response.json();
      // console.log("updatedMetaObject", data);
      setLoading(false);
      // setToastProps({
      //   content: `City Dropdown List Updated Successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      setToastProps({
        content: `City Dropdown List Updated Successfully`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      // shopify.toast.show("City Dropdown List Updated Successfully")
      // setValue("")
      await delay();
      await handleGetMetaObjects();
      // setValue(`${PrevList.current}`);
    } catch (error) {
      // setToastProps({
      //   content: `${error.message}`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      setToastProps({
        content: `${error.message}`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      // shopify.toast.show(`${error.message}`)
      console.log("updatedMetaObject error", error);
    }
  };
  const handleCreateMetaObjectCities = async () => {
    try {
      // let value; // No value assigned, so list remains unchanged
      // let list = "karachi, lahore, Islamabad, abbottabad";

      let formattedString = JSON.stringify(
        { countries: JSON.parse(DEFAULT_CITIES).countries },
        null,
        2
      );

      // Expected output:
      // "\nKarachi\nLahore\nIslamabad\nAbbottabad\n"
      // console.log("checkup", formattedString);
      // return;
      const response = await fetch("/api/addMetaObjectCities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: META_OBJECT_TYPE,
          value: `${formattedString}`,
          key: META_OBJECT_KEY,
        }),
      });
      const data = await response.json();
      console.log("addMetaObject", data);

      if (data.response.body.data.metaobjectCreate.userErrors.length > 0) {
        setToastProps({
          content: `Perhaps No Definition (Schema) created yet for the Cities metaobject. let us do the honors.`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        // shopify.toast.show("Perhaps No Definition (Schema) created yet for the Cities metaobject. let us do the honors.")
        // setToastProps({
        //   content: `Perhaps No Definition (Schema) created yet for the Cities metaobject. let us do the honors.`,
        //   onDismiss: () => setToastProps(emptyToastProps),
        // });
        handleCreateMetaObjectDefinition();
        return;
      }
      // setToastProps({
      //   content: `Default list of cities created. review checkout Delivery City column.`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      setActiveStep((prev) => prev + 1);
      setIsLoading(true); // Reset for next step

      setMetaObjectId(
        `${
          data.response.body.data.metaobjectCreate.metaobject.id.split(
            "Metaobject/"
          )[1]
        }`
      );

      // setLoading(false);
      // setToastProps({
      //   content: `City Dropdown List Updated Successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      // setValue("")
      //  shopify .toast.show("Default Countries & Cities list added.");
      setToastProps({
        content: `Default Countries & Cities list added`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      handleGetMetaObjects();
    } catch (error) {
      setToastProps({
        content: `${error.message}`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      console.log("addMetaObject error", error);
    }
  };
  const handleCreateMetaObjectDefinition = async () => {
    if (isLoading) {
      setIsLoading(false); // Reset for next step
    }
    try {
      const response = await fetch("/api/createMetaObjectDefinitionCities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: META_OBJECT_TYPE,
          key: META_OBJECT_KEY,
          name: FIELD_NAME,
          dataType: FIELD_TYPE,
        }),
      });
      const data = await response.json();

      if (
        data?.response?.body?.data?.metaobjectDefinitionCreate?.userErrors
          ?.length > 0
      ) {
        console.log(
          "error create schema deinition.",
          data?.response?.body?.data?.metaobjectDefinitionCreate?.userErrors
        );
        setToastProps({
          content: `something went wrong creating cities model contact developer`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        //shopify.toast.show("something went wrong creating cities model contact developer")
        // setToastProps({
        //   content: `Something went wrong creating metaobject definition contact developer`,
        //   onDismiss: () => setToastProps(emptyToastProps),
        // });
        // handleCreateMetaObjectDefinition();
        return;
      }
      setActiveStep((prev) => prev + 1);
      setIsLoading(true); // Reset for next step
      // setMetaObjectId(`${data.response.body.data.metaobjectDefinitionCreate.
      //   metaobjectDefinition.id.split("Metaobject/")[1]}`)

      handleGetMetaObjects();
      // console.log("Definition MetaObject", data);
      // setLoading(false);
      // setToastProps({
      //   content: `City Dropdown List Updated Successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      // setValue("")
    } catch (error) {
      // setToastProps({
      //   content: `${error.message}`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      console.log("DefinitionMetaObject error", error);
    }
  };
  const handleGetMetaObjects = async () => {
    try {
      // setLoading(true);
      const response = await fetch(
        `/api/getMetaObjectCities?id=${META_OBJECT_TYPE}&key=${META_OBJECT_KEY}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log("getMetaObject", data);

      if (data.response.metaobjects.nodes.length === 0) {
        setToastProps({
          content: `No MetaObjects (cities found). wait while we're creating new list for you.`,
          onDismiss: () => setToastProps(emptyToastProps),
        });
        //  shopify.toast.show("No MetaObjects (cities found). wait while we're creating new list for you.")
        // setToastProps({
        //   content: `No MetaObjects (cities found). wait while we're creating new list for you.`,
        //   onDismiss: () => setToastProps(emptyToastProps),
        // });
        handleCreateMetaObjectCities();
        return;
      }
      // setToastProps({
      //   content: `Previously Saved Cities list Retreived.`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });

      updateCities(data);
      setMetaObjectId(
        `${data.response.metaobjects.nodes[0].id.split("Metaobject/")[1]}`
      );
      setToastProps({
        content: `Previously Saved Cities list Retreived.tap fill previous list button to fill it.`,
        onDismiss: () => setToastProps(emptyToastProps),
      });
      // shopify.toast.show("Previously Saved Cities list Retreived.tap fill previous list button to fill it.")
      setActiveStep((prev) => prev + 3);
      setIsLoading(true); // Reset for next step

      // setLoading(false);
      // setToastProps({
      //   content: `City Dropdown List Updated Successfully`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      // setValue("")
    } catch (error) {
      // setToastProps({
      //   content: `${error.message}`,
      //   onDismiss: () => setToastProps(emptyToastProps),
      // });
      console.log("getMetaObject error", error);
    }
  };

  const updateCities = (data) => {
    const findCities = data.response.metaobjects.nodes.find((metaObject) =>
      metaObject.type.includes(META_OBJECT_TYPE)
    );
    // const output = findCities.title.value.trim().split("\n").map(city => city.toLowerCase()).join(",") + ",islamabad";

    const output = findCities.title.value
      .split(`\\n`)
      .filter((city) => Object.keys(city).length !== 0 && city.toLowerCase())
      .join(",");

    setAllCountry(
      JSON.parse(output).countries.map((country) =>
        capitalizeAndTrim(country.name)
      )
    );

    setAllCountryCities(JSON.parse(output).countries);

    //remove this code for dynamic
    const getCurrentCountryCities = JSON.parse(output)
      .countries.find((country) =>
        country?.name
          ?.toLowerCase()
          .trim()
          .includes("pakistan"?.toLowerCase().trim())
      )
      ?.cities.join(",");
    // console.log('dill', getCurrentCountryCities)
    setValue(getCurrentCountryCities);

    return;

    console.log("check", output);
    // return;
    PrevList.current = output;
    setValue(`${output}`);
  };
  useEffect(() => {
    handleGetMetaObjects();
    return;
    fetch("/api/billing") // Express API call
      .then((res) => res.json())
      .then((data) => {
        if (!data.subscription) {
          navigate("/pricing");
        } else {
          setCheckSubscription(true);
          setUrl(data.billingUrl);
          handleGetMetaObjects();
        }
        // setSubscription(data.subscription);
        // setSubscriptionName(data.name);
      })
      .catch((error) => console.error("Error fetching billing info:", error));

    // handleCreateMetaObjectDefinition();

    // handleCreateMetaObjectCities();

    // if (check === false) {
    // }
  }, []);
  // useEffect(() => {
  //   // handleCreateMetaObjectDefinition();

  //   // handleCreateMetaObjectCities();

  //   handleNextStep()

  // }, [activeStep])
  // console.log('id', PrevList.current)

  // if (!checkSubscription) {
  //   return (
  //     <Page fullWidth>
  //       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
  //         <div style={{ transform: "scale(2.5)" }}> {/* Adjust scale value as needed */}
  //           <Spinner accessibilityLabel="Loading" size="large" />
  //         </div>
  //       </div>
  //     </Page>
  //   );
  // }
  return (
    <Page
      fullWidth
      primaryAction={{
        content: "Update",
        disabled: false,
        onAction: handleUpdateMetaObjectCities,
        loading: loading,
      }}
      // subtitle="Use Below Textfield to update cities dropdown present at checkout."

      title="Update City Dropdown"
      actionGroups={[
        // {
        //   title: 'Copy',
        //   onClick: (openActions) => {
        //     alert('Copy action');
        //     openActions();
        //   },
        //   actions: [{ content: 'Copy to clipboard' }],
        // },
        // {
        //   title: 'Promote',
        //   disabled: true,
        //   actions: [{ content: 'Share on Facebook' }],
        // },
        {
          title: "More options",
          actions: [
            {
              content: "Fill Default List",
              // accessibilityLabel: 'Fill duplicate list',
              onAction: () => setValue(`${DEFAULT_CITIES_PAKISTAN}`),
            },
            // ...(selectedCountry.toLowerCase().trim().includes("pakistan")
            //   ? [
            //       {
            //         content: "Fill Previous List",
            //         onAction: () => setValue(`${PrevList.current}`),
            //       },
            //     ]
            //   : []),
          ],
        },
      ]}
    >
      <Frame>
        {dismiss && (
          <div
            style={{
              marginBottom: "15px",
              borderRadius: "20px",
            }}
          >
            <CalloutCard
              title="Delivery City Selection for Pakistan"
              illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
              primaryAction={{
                content: "Yeah Done Looking",
                onAction: () => setDismiss(false),
              }}
            >
              <p style={{ marginBottom: "-10px", marginTop: "-14px" }}>
                Auto-updated cities from Shopify Admin with a smooth dropdown
                experience at checkout cities dropdown.
              </p>
            </CalloutCard>
          </div>
        )}

        {/* <AlphaCard sectioned>
        <VerticalStack vertical spacing="loose">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isDisabled = index > activeStep;

            return (
              <div
                key={step.title}
                className={`step ${isDisabled ? 'disabled' : ''} ${isCompleted ? 'completed' : ''
                  }`}
              >
                <Text variant="headingMd" as="h3">
                  {step.title}
                </Text>
                <div className="step-content">
                  {isActive && isLoading ? (
                    <>
                      <span className="loading-dots">...</span>
                      <Text variant="bodyMd">{step.loadingText}</Text>
                    </>
                  ) : isCompleted || (isActive && !isLoading) ? (
                    <Text variant="bodyMd">{step.completedText}</Text>
                  ) : null}
                </div>
              </div>
            );
          })}
        </VerticalStack>

      </AlphaCard> */}

        <p style={{ fontWeight: 600 }}>Delivery Cities</p>
        {/* <div style={{ width: "100%", }}> */}
        <textarea
          placeholder="City01, City02, City03..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          rows={4} // Minimum 4 lines
          style={{
            // borderStartEndRadius: "15px",
            // borderEndStartRadius: "15px",
            marginTop: "5px",
            width: "100%", // Full width le ga
            minWidth: "500px", // Minimum width set karne ke liye
            maxWidth: "100%", // Jitni parent container ki width hogi, utni lega
            padding: "10px", // Thoda inner space dene ke liye
            fontSize: "14px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            resize: "vertical", // User apni marzi se size adjust kar sakta hai
          }}
        />

        {/* <text
          placeholder="Karachi,Lahore,Islamabad....."
          label={<p style={{ fontWeight: 600 }}>City List</p>}
          value={value}
          onChange={handleChange}
          // multiline={{ resizable: true, }}
          autoComplete="off"
        /> */}

        <div style={{ opacity: 0.5, textAlign: "left" }}>
          Comma Seperated Cities required to update.
        </div>
        {/* </div> */}
        {toastMarkup}
      </Frame>
    </Page>
  );
}
