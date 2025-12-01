import { useState, useEffect } from "react";
import {
  reactExtension,
  Banner,
  BlockStack,
  Text,
  useApi,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
  useShippingAddress,
  useApplyShippingAddressChange,
  TextField,
  ScrollView,
  Pressable,
  InlineStack,
} from "@shopify/ui-extensions-react/checkout";
import { Icon } from "@shopify/ui-extensions/checkout";
import { logErrorToApp } from "../../HelperError/ErrorLog.jsx"

export default reactExtension(
  "purchase.checkout.delivery-address.render-before",
  () => <DiscountComponent />
);

function DiscountComponent() {
  const META_OBJECT_TYPE = "city__";
  const { ui: _ui, query } = useApi();
  const applyAttributeChange = useApplyAttributeChange();
  const { countryCode, city, firstName, lastName, address1, address2, phone } =
    useShippingAddress();
  const applyShippingAddressChange = useApplyShippingAddressChange();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isBanner, setIsBanner] = useState(false);
  const [isBlocked, setisBlocked] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [isFilled, setisFilled] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isInfo, setIsInfo] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isBannerTimeout, setIsBannerTimeout] = useState(false);
  const [userCities, setUserCities] = useState([]);
  const [userFilterCities, setFilterUserCities] = useState([]);
  const [allCountry, setAllCountry] = useState([]);
  const [allCountryCities, setAllCountryCities] = useState([]);

  const capitalizeAndTrim = (value) => {
    return value?.charAt(0)?.toUpperCase() + value.slice(1)?.toLowerCase();
  };

  const countryCodeToName = {
    AD: "Andorra",
    AE: "United Arab Emirates",
    AF: "Afghanistan",
    AG: "Antigua and Barbuda",
    AI: "Anguilla",
    AL: "Albania",
    AM: "Armenia",
    AO: "Angola",
    AR: "Argentina",
    AS: "American Samoa",
    AT: "Austria",
    AU: "Australia",
    AW: "Aruba",
    AX: "Åland Islands",
    AZ: "Azerbaijan",
    BA: "Bosnia and Herzegovina",
    BB: "Barbados",
    BD: "Bangladesh",
    BE: "Belgium",
    BF: "Burkina Faso",
    BG: "Bulgaria",
    BH: "Bahrain",
    BI: "Burundi",
    BJ: "Benin",
    BL: "Saint Barthélemy",
    BM: "Bermuda",
    BN: "Brunei Darussalam",
    BO: "Bolivia",
    BQ: "Bonaire, Sint Eustatius and Saba",
    BR: "Brazil",
    BS: "Bahamas",
    BT: "Bhutan",
    BV: "Bouvet Island",
    BW: "Botswana",
    BY: "Belarus",
    BZ: "Belize",
    CA: "Canada",
    CC: "Cocos (Keeling) Islands",
    CD: "Congo",
    CF: "Central African Republic",
    CG: "Congo",
    CH: "Switzerland",
    CI: "Côte d'Ivoire",
    CK: "Cook Islands",
    CL: "Chile",
    CM: "Cameroon",
    CN: "China",
    CO: "Colombia",
    CR: "Costa Rica",
    CU: "Cuba",
    CV: "Cabo Verde",
    CW: "Curaçao",
    CX: "Christmas Island",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DE: "Germany",
    DJ: "Djibouti",
    DK: "Denmark",
    DM: "Dominica",
    DO: "Dominican Republic",
    DZ: "Algeria",
    EC: "Ecuador",
    EE: "Estonia",
    EG: "Egypt",
    EH: "Western Sahara",
    ER: "Eritrea",
    ES: "Spain",
    ET: "Ethiopia",
    FI: "Finland",
    FJ: "Fiji",
    FM: "Federated States of Micronesia",
    FO: "Faroe Islands",
    FR: "France",
    GA: "Gabon",
    GB: "United Kingdom",
    GD: "Grenada",
    GE: "Georgia",
    GF: "French Guiana",
    GG: "Guernsey",
    GH: "Ghana",
    GI: "Gibraltar",
    GL: "Greenland",
    GM: "Gambia",
    GN: "Guinea",
    GP: "Guadeloupe",
    GQ: "Equatorial Guinea",
    GR: "Greece",
    GT: "Guatemala",
    GU: "Guam",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HK: "Hong Kong",
    HM: "Heard Island and McDonald Islands",
    HN: "Honduras",
    HR: "Croatia",
    HT: "Haiti",
    HU: "Hungary",
    ID: "Indonesia",
    IE: "Ireland",
    IL: "Israel",
    IM: "Isle of Man",
    IN: "India",
    IO: "British Indian Ocean Territory",
    IQ: "Iraq",
    IR: "Iran",
    IS: "Iceland",
    IT: "Italy",
    JE: "Jersey",
    JM: "Jamaica",
    JO: "Jordan",
    JP: "Japan",
    KE: "Kenya",
    KG: "Kyrgyzstan",
    KH: "Cambodia",
    KI: "Kiribati",
    KM: "Comoros",
    KN: "Saint Kitts and Nevis",
    KP: "North Korea",
    KR: "South Korea",
    KW: "Kuwait",
    KY: "Cayman Islands",
    KZ: "Kazakhstan",
    LA: "Laos",
    LB: "Lebanon",
    LC: "Saint Lucia",
    LI: "Liechtenstein",
    LK: "Sri Lanka",
    LR: "Liberia",
    LS: "Lesotho",
    LT: "Lithuania",
    LU: "Luxembourg",
    LV: "Latvia",
    LY: "Libya",
    MA: "Morocco",
    MC: "Monaco",
    MD: "Moldova",
    ME: "Montenegro",
    MF: "Saint Martin",
    MG: "Madagascar",
    MH: "Marshall Islands",
    MK: "North Macedonia",
    ML: "Mali",
    MM: "Myanmar",
    MN: "Mongolia",
    MO: "Macao",
    MP: "Northern Mariana Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MS: "Montserrat",
    MT: "Malta",
    MU: "Mauritius",
    MV: "Maldives",
    MW: "Malawi",
    MX: "Mexico",
    MY: "Malaysia",
    MZ: "Mozambique",
    NA: "Namibia",
    NC: "New Caledonia",
    NE: "Niger",
    NF: "Norfolk Island",
    NG: "Nigeria",
    NI: "Nicaragua",
    NL: "Netherlands",
    NO: "Norway",
    NP: "Nepal",
    NR: "Nauru",
    NU: "Niue",
    NZ: "New Zealand",
    OM: "Oman",
    PA: "Panama",
    PE: "Peru",
    PF: "French Polynesia",
    PG: "Papua New Guinea",
    PH: "Philippines",
    PK: "Pakistan",
    PL: "Poland",
    PM: "Saint Pierre and Miquelon",
    PN: "Pitcairn",
    PR: "Puerto Rico",
    PT: "Portugal",
    PW: "Palau",
    PY: "Paraguay",
    QA: "Qatar",
    RE: "Réunion",
    RO: "Romania",
    RS: "Serbia",
    RU: "Russia",
    RW: "Rwanda",
    SA: "Saudi Arabia",
    SB: "Solomon Islands",
    SC: "Seychelles",
    SD: "Sudan",
    SE: "Sweden",
    SG: "Singapore",
    SH: "Saint Helena",
    SI: "Slovenia",
    SJ: "Svalbard and Jan Mayen",
    SK: "Slovakia",
    SL: "Sierra Leone",
    SM: "San Marino",
    SN: "Senegal",
    SO: "Somalia",
    SR: "Suriname",
    SS: "South Sudan",
    ST: "São Tomé and Príncipe",
    SV: "El Salvador",
    SX: "Sint Maarten",
    SY: "Syria",
    SZ: "Eswatini",
    TC: "Turks and Caicos Islands",
    TD: "Chad",
    TF: "French Southern Territories",
    TG: "Togo",
    TH: "Thailand",
    TJ: "Tajikistan",
    TK: "Tokelau",
    TL: "Timor-Leste",
    TM: "Turkmenistan",
    TN: "Tunisia",
    TO: "Tonga",
    TR: "Turkey",
    TT: "Trinidad and Tobago",
    TV: "Tuvalu",
    TZ: "Tanzania",
    UA: "Ukraine",
    UG: "Uganda",
    UM: "United States Minor Outlying Islands",
    US: "United States",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VA: "Vatican City",
    VC: "Saint Vincent and the Grenadines",
    VE: "Venezuela",
    VG: "British Virgin Islands",
    VI: "U.S. Virgin Islands",
    VN: "Vietnam",
    VU: "Vanuatu",
    WF: "Wallis and Futuna",
    WS: "Samoa",
    YE: "Yemen",
    YT: "Mayotte",
    ZA: "South Africa",
    ZM: "Zambia",
    ZW: "Zimbabwe",
  };

  const handleCityNull = async () => {
    console.log("setty");

    await applyShippingAddressChange({
      type: "updateShippingAddress",
      address: {
        city: undefined, // Update with the new city value
      },
    });
  };

  const checkFormattedCity = async (user_city) => {
    try {
      if (!user_city) return false;
      const cities = userCities.map((value) =>
        value?.label?.toLowerCase()?.trim()
      ); // Normalize city names to lowercase

      if (!cities.includes(user_city?.toLowerCase()?.trim())) {
        console.error("City not valid.");
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error("City validation error:", error);
    }
  };

  const handleFiltersQueryChange = (value) => {
    if (!value) return;
    console.log("just in");
    // setSelectedCity(value);
    // const filter = filteredEmployees.filter((data) => data.email === value);
    // console.log(filter);
    // setUserCities(filter);

    if (value === "") {
      // If input is cleared, reset the filtered discounts to the full list
      setFilterUserCities(userCities);
    } else {
      // Filter the full list of discounts based on the current input value

      // if (!value) {
      //   value = city;
      // }
      const filtered = userCities.filter((data) =>
        data.label.toLowerCase().trim().includes(value.toLowerCase().trim())
      );
      if (filtered.length > 0) {
        setFilterUserCities(filtered);
      }
    }
  };

  useBuyerJourneyIntercept(async ({ canBlockProgress }) => {
    try {
      if (countryCode !== "PK") return { behavior: "allow" };
      //shipping get validation
      // https://github.com/Shopify/ui-extensions/issues/630
      // console.log(city, "user input city");
      setSelectedCountry(countryCodeToName[countryCode] || "Unknown");
      resetScenarioTwo();

      // console.log("is checkFormattedCity", validateCity(city));

      if ((await checkFormattedCity(city)) === false) {
        setisBlocked(true);
        setIsBanner(false);
        return {
          behavior: "block",
          reason: "Invalid shipping city",
          errors: [
            {
              message: `Choose city name from the delivery dropdown`,
              target: "$.purchase.checkout.block.render",
            },
          ],
          // perform: () => setIsBanner(false),
        };
      }

      setisBlocked(false);
    } catch(error) {
      await logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "useBuyerJourneyIntercept" });
    }
    return { behavior: "allow" };
  });

  function resetScenarioTwo(data = userCities) {
    console.log("user cities", userCities);
    if (city && !selectedCity) {
      const matchedCity = data.find(
        (_city) =>
          _city?.label?.toLowerCase().trim() === city?.toLowerCase().trim()
      );
      // console.log("mait", city?.toLowerCase(), matchedCity.value);
      // return;
      const cityLabel = matchedCity ? matchedCity.label : undefined;
      console.log("matchedCity", matchedCity);
      if (!matchedCity) return;
      if (selectedCity === "" && city) {
        setSelectedCity(matchedCity?.label);
      }
      handleFiltersQueryChange(matchedCity?.label);
    }
  }

  const handleCityChange = async (_city = "") => {
    console.log("handleCityChange", _city);
    try {
      const matchedCity = userCities.find(
        (city) => city.value === _city && city.value !== "769"
      );
      // const cityLabel = matchedCity ? matchedCity.label : undefined;

      // if (!_city) {
      //   setSelectedCity(_city); // Update the state

      if (matchedCity) {
        await applyShippingAddressChange({
          type: "updateShippingAddress",
          address: {
            city: matchedCity.label, // Update with the new city value
          },
        });
        setisFilled(true);
      }
    } catch(error) {
      logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "handleCityChange" });
    }
  };

  function updateFilteredCity() {
    // console.log('yose')
    try {
      handleFiltersQueryChange(selectedCity);

      // console.log('finasde', userFilterCities.length <= 0, userCities.length > 0)
      // if (userFilterCities.length <= 0 && userCities.length > 0) {
      //   console.log('final tttt', userCities)

      //   setFilterUserCities(userCities)
      // }
    } catch(error) {
      logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "updateFilteredCity" });

    }
  }

  async function resetCity() {
    console.log("checkings", "selected city", selectedCity, "city", city);
    try {
      if (!selectedCity && city && !isBlocked) {
        if (!isBanner) {
          setIsBanner(true);
        }
        return;
      }
      // if (city === null || city === undefined) {
      //   handleCityChange(selectedCity);
      //   return;
      // }
      // if (city && firstName && lastName) {
      //   console.log("direct city2", city, selectedCity, firstName, lastName);
      //   handleInitialChange(city);

      //   return;
      // }

      if (!city) {
        // setCheck(false);
        setIsInfo(true);

        // console.log(
        //   "what about selected city here if user city field is null",
        //   selectedCity
        // );
        const filtered = userCities.find((data) =>
          data.label
            .toLowerCase()
            .trim()
            .includes(selectedCity.toLowerCase().trim())
        );
        if (filtered) {
          handleCityChange(filtered.value);
        }
      }
      // else {
      //   setIsInfo(false);
      //   setCheck(false);

      // }
      if (selectedCity !== city) {
        // await delay()
        // setCheck(false);
        setIsInfo(true);

        // console.log("selected city", selectedCity, "user city right now", city);

        const filtered = userCities.find((data) =>
          data.label
            .toLowerCase()
            .trim()
            .includes(selectedCity.toLowerCase().trim())
        );
        console.log("selectedCity !city chs", filtered);

        handleCityChange(filtered.value);
      }
    } catch(error) {
      await logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "resetCity" });

    }
    // else {
    //   // setIsInfo(false);
    //   // setIsInfo(false);
    //   setCheck(false);
    // }
  }

  function handleCityUpdate() {
    try {
      if (countryCode !== "PK") return;

      // console.log("condition 1", selectedCity);
      // console.log("condition 2", !isFilled);
      // console.log("condition 3", city);
      // console.log(
      //   "condition 4",
      //   !selectedCity
      //     ?.toLowerCase()
      //     ?.trim()
      //     ?.includes(city?.toLowerCase()?.trim())
      // );
      // true,true,true,true

      if (
        // selectedCity &&
        city &&
        !selectedCity
          ?.toLowerCase()
          ?.trim()
          ?.includes(city?.toLowerCase()?.trim()) &&
        !isFilled
      ) {
        // setSelectedCity("");
        return;
      }

      if (!city) {
        setisFilled(false);
        setSelectedCity("");
        return;
      }
      // if (!selectedCity) return;
      if (isFocus) {
        setIsFocus(false);
      }

      resetCity();
    } catch(error) {
      logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "handleCityUpdate" });

    }
  }

  useEffect(() => {
    if (countryCodeToName[countryCode]) {
      // validateCity();
      handleCityChange(countryCodeToName[countryCode]);
    }
    if (countryCode === "PK") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [selectedCountry, city, countryCode]);

  useEffect(() => {
    applyAttributeChange({
      key: "delivery_country",
      value: countryCode,
      type: "updateAttribute",
    });

    if (countryCode === "PK") {
      // fetchCities("Pakistan");
      console.log("i worked initially");
      setIsModalOpen(true);
      // handleCityChange("Pakistan");
      // initialCity("Pakistan");
      // return {
      //   behavior: "block",
      //   reason: "Invalid shipping country",
      //   errors: [
      //     {
      //       message: "Please accept the duties and customs charges",
      //       target: "$.purchase.checkout.block.render",
      //     },
      //   ],
    } else {
      // handleCityChange(null, true);
      handleCityNull();
      setIsModalOpen(false);
    }
  }, [countryCode]); // Ensure validation runs when either value changes

  useEffect(() => {
    // return;
    handleCityUpdate();
  }, [city]);

  // useEffect(() => {
  //   if (
  //     // selectedCity &&
  //     city &&
  //     !selectedCity
  //       ?.toLowerCase()
  //       ?.trim()
  //       ?.includes(city?.toLowerCase()?.trim()) &&
  //     !isFilled
  //   ) {
  //     setSelectedCity("");
  //     return;
  //   }
  // }, [selectedCity, city]);
  // useEffect(() => {
  //   if ((city === null || city === undefined) && countryCode === "PK") {
  //     handleCityChange(selectedCity);
  //     return;
  //   }
  //   // if (city && firstName && lastName) {
  //   //   console.log("direct city2", city, selectedCity, firstName, lastName);
  //   //   handleInitialChange(city);

  //   //   return;
  //   // }
  //   if (!city && countryCode === "PK") {
  //     console.log("user city field is null", city);
  //     console.log(
  //       "what about selected city here if user city field is null",
  //       selectedCity
  //     );
  //     handleCityChange(city);
  //   }
  //   if (selectedCity !== city && countryCode === "PK") {
  //     console.log(
  //       "selected city",
  //       selectedCity,
  //       "checks user city right now",
  //       city
  //     );

  //     handleCityChange(
  //       city
  //     );
  //   }
  // }, [city]);

  useEffect(() => {
    setLoader(true);
    query(
      `{
  metaobjects(type: "${META_OBJECT_TYPE}",first:10) {
    nodes{
      id
      type
      fields {
        key
        value
      }
    
    }
  
  }
}`
    )
      .then(({ data, errors }) => {
        // console.log('checker', data);
        const parsedData = JSON.parse(
          data?.metaobjects?.nodes[0]?.fields[0]?.value
        );
        // console.log(JSON.parse(data?.metaobjects?.nodes[0]?.fields[0]?.value))

        // return;
        // const ress = data.metaobjects.nodes[0].fields[0].value.split(`\\n`).filter(val => val.trim() !== "").map((val, index) => ({
        //   label: val,
        //   value: `${index + 1}`,
        // }))
        setAllCountry(
          parsedData.countries.map((country) => capitalizeAndTrim(country.name))
        );
        setAllCountryCities(parsedData.countries);

        // console.log('checker', parsedData.countries, "selectedCountry", selectedCountry);

        const getCurrentCountryCities = parsedData.countries
          .find((country) =>
            country?.code
              ?.toLowerCase()
              .trim()
              .includes("PK".toLowerCase().trim())
          )
          ?.cities.map((val, index) => ({
            label: val,
            value: `${index + 1}`,
          }));
        // console.log("parsedData", parsedData.countries.find((country) => country?.name?.toLowerCase().trim().includes(countryCode?.toLowerCase().trim()))?.cities, "selectedCountry", selectedCountry);

        if (getCurrentCountryCities?.length > 0) {
          setIsModalOpen(true);
          setUserCities([...getCurrentCountryCities]);
          // setFilterUserCities(getCurrentCountryCities);

          setFilterUserCities([...getCurrentCountryCities]);
        }

        console.log("checker", getCurrentCountryCities);

        if (errors) {
          console.log("error fetching metadata", errors);
        }
        setLoader(false);

        resetScenarioTwo(getCurrentCountryCities);

        return;
        // old single country cities work

        // setLoading(true);

        console.log("checker", data);
        const ress = data.metaobjects.nodes[0].fields[0].value
          .split(`\\n`)
          .filter((val) => val.trim() !== "")
          .map((val, index) => ({
            label: val,
            value: `${index + 1}`,
          }));
        console.log("success data from checkboxes", ress);

        setUserCities([...ress]);
        setFilterUserCities([...ress]);
        if (errors) {
          console.log("error fetching metadata", errors);
        }
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        // setIsLoading(false);
        logErrorToApp(error, "ERROR", { fileName: "delivery_city/Checkout.jsx", functionName: "getCurrentCountryCities" });

        console.log("error fetching metadata", error);
      });
  }, []);

  useEffect(() => {
    if (isFocus) {
      setIsFocus(false);
    }
    if (isFilled) {
      setisFilled(false);
    }
    if (isBanner) {
      setIsBanner(false);
    }
  }, [phone, address1, address2, firstName, lastName, countryCode]);

  useEffect(() => {
    // resetTimer();
    // if (!selectedCity) return;
    // if (!city) return;
    if (countryCode !== "PK") {
      setSelectedCity("");
    }
    updateFilteredCity();
    // return () => clearTimeout(debounceRef.current);
  }, [selectedCity]);

  // console.log("f");
  return (
    <BlockStack border={"none"}>
      {isModalOpen && countryCode === "PK" && (
        <>
          {isBanner && (
            <Banner status="info">
              Choose city name from the delivery dropdown
            </Banner>
          )}
          {!isBanner && selectedCity.length > 0 && isFocus && (
            <Banner status="info">
              Select your city from the dropdown to fill the city field.
            </Banner>
          )}
          <TextField
            // suffix={"˅"} // U+02C5 (non-filled chevron down)
            icon={{ source: "chevronDown", position: "end" }}
            onFocus={() => setIsFocus(true)}
            label="Select Delivery City"
            value={selectedCity}
            onInput={(value) => {
              // console.log('check', value)
              setSelectedCity(value);
              // handleFiltersQueryChange(value);
              //below is placed at button of cities list of choosing.
              // handleCityChange(value);
            }}
            type="text"
          // options={userCities}
          // autoComplete="off"
          />

          {isFocus && (
            <BlockStack padding="loose" background={"subdued"}>
              {/* Suggested cities */}

              {/* <ScrollView
                border={"none"}
                background={"subdued"}
                maxBlockSize={200}
              > */}
              {/* <BlockSpacer /> */}
              <BlockStack
                border={"none"}
                background={"subdued"}
                inlineAlignment={"start"}
              >
                {selectedCity.length > 2 && userFilterCities.length > 0 ? (
                  <>
                    <Text size="medium" emphasis="bold">
                      Suggested Cities
                    </Text>
                    {userFilterCities.map((city) => (
                      <Pressable
                        minInlineSize="fill"
                        // background="base"
                        key={city.value}
                        border="none"
                        cornerRadius="none"
                        padding="none"
                        background="transparent"
                        // opacity={Style.default('100') // fully visible
                        //   .when({ hover: true }, '20') // dim to 20% on hover
                        //   .when({ focus: true }, '20')} // also dim on focus

                        onPress={() => {
                          setSelectedCity(city.label);
                          setIsFocus(false);
                          handleCityChange(city.value);
                          handleFiltersQueryChange(city.label);
                        }}
                      >
                        {city.label}
                      </Pressable>
                    ))}
                  </>
                ) : selectedCity.length > 2 && userFilterCities.length === 0 ? (
                  <InlineStack blockAlignment="center" spacing="loose">
                    <Icon source="info" />
                    <Text size="base">No suggested city available</Text>
                  </InlineStack>
                ) : (
                  ""
                )}
              </BlockStack>
              {/* </ScrollView> */}
              {/* All cities */}

              {userCities.length > 0 && (
                <>
                  <Text size="medium" emphasis="bold">
                    All Cities
                  </Text>
                  <ScrollView
                    border={"none"}
                    background={"subdued"}
                    maxBlockSize={200}
                  >
                    {/* <BlockSpacer /> */}
                    <BlockStack
                      border={"none"}
                      background={"subdued"}
                      inlineAlignment={"start"}
                    >
                      {userCities.map((city) => (
                        <Pressable
                          minInlineSize="fill"
                          // background="base"
                          key={city.value}
                          border="none"
                          cornerRadius="none"
                          padding="none"
                          background="transparent"
                          // opacity={Style.default('100') // fully visible
                          //   .when({ hover: true }, '20') // dim to 20% on hover
                          //   .when({ focus: true }, '20')} // also dim on focus

                          onPress={() => {
                            setIsFocus(false);
                            setSelectedCity(city.label);
                            handleCityChange(city.value);
                            handleFiltersQueryChange(city.label);
                          }}
                        >
                          {city.label}
                        </Pressable>
                      ))}
                    </BlockStack>
                  </ScrollView>
                </>
              )}
            </BlockStack>
          )}
        </>
      )}
    </BlockStack>
  );
}
