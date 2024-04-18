import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
const OpeningHours = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const localId = localStorage.getItem("_id");
  const [experienceId, setExperienceId] = useState(localId ? localId : "");
  const [data, setData] = useState([]);

  useEffect(() => {
    (async function () {
      const data = await fetch(
        `https://demo.turangh.com/experience/${experienceId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await data.json();
      const { availability_detail } = result;
      if (availability_detail && availability_detail.length > 0) {
        console.log(availability_detail);
        setShowDefaultOperatingHours(true);
        const newData = availability_detail.map((day) => {
          const key = Object.keys(day)[0];
          const keys = day.day;

          const openHour = day.openHour;
          const closeHour = day.closeHour;
          const open24Hours = day.open24Hours;
          return {
            [keys]: {
              openHour,
              closeHour,
              open24Hours: open24Hours,
              isOpen: true,
            },
          };
        });
        console.log(newData);
        setData(newData);
        return;
      }
      if (!experienceId && experienceId.length === 0) {
        alert("please add titel and categories");
        navigate("/titel");
        return;
      }
    })();
    if (!experienceId && experienceId.length === 0) {
      alert("please add titel and categories");
      navigate("/titel");
    }
  }, []);
  const [showDefaultOperatingHours, setShowDefaultOperatingHours] =
    useState(false);
  const createOpeningHours = async () => {
    if (!showDefaultOperatingHours) {
      navigate("/bookingCutoff", {
        state: {
          ...{},
        },
      });
      return;
    }
    if (data.length === 0) {
      alert("please fill in all the fields");
      return;
    }
    const formattedAvailability = [];
    data.forEach((day) => {
      const key = Object.keys(day)[0];
      const openHour = day[key].openHour;
      const closeHour = day[key].closeHour;
      const open24Hours = day[key].open24Hours;
      const availabilityData = {
        day: Object.keys(day)[0],
        isOpen: true,
        open24Hours: day[key].open24Hours,
        openHour: open24Hours ? "00:00" : openHour,
        closeHour: open24Hours ? "00:00" : closeHour,
      };
      formattedAvailability.push(availabilityData);
    });
    console.log("formattedAvailability", formattedAvailability);
    const data2 = {
      availability_detail: formattedAvailability,
    };
    const response = await fetch(
      `https://demo.turangh.com/experience/updateAvailability/${experienceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data2),
      }
    );
    const result = await response.json();
    if (result) {
      navigate("/bookingCutoff", {
        state: {
          ...{},
        },
      });
    }
  };
  const goBack = () => {
    navigate("/timeDatePass");
  };
  const checkboxOnchange = (e, dayName) => {
    console.log("checkboxOnchange", e, dayName);
    const check = e.target.checked;
    console.log("data1", data);
    const mondayData = data.filter((item) => item["Monday"]);
    // if mondayData is not empty copy it to selectedData
    const selectedData = mondayData.length > 0 ? mondayData : data;
    console.log("selectedData", selectedData);

    if (mondayData && mondayData.length > 0) {
      setData((a) =>
        check
          ? [
              ...a,
              {
                [dayName]: {
                  openHour:
                    mondayData[0].Monday.openHour !== "00:00"
                      ? mondayData[0].Monday.openHour
                      : "00:00",
                  closeHour:
                    mondayData[0].Monday.closeHour !== "00:00"
                      ? mondayData[0].Monday.closeHour
                      : "00:00",
                  isOpen: true,
                },
              },
            ]
          : a.filter((item) => !item[dayName])
      );
    } else {
      setData((a) =>
        check
          ? [
              ...a,
              {
                [dayName]: {
                  openHour: "00:00",
                  closeHour: "00:00",
                  isOpen: true,
                },
              },
            ]
          : a.filter((item) => !item[dayName])
      );
    }
  };
  console.log("data", data);

  const timeOnchange = (dayName, type) => (time) => {
    console.log("timeOnchange", time.format());
    setData((a) =>
      a.map((item) =>
        item[dayName] ? { [dayName]: { ...item[dayName], [type]: time } } : item
      )
    );
  };
  const onIs24HoursChange = (dayName) => (e) => {
    console.log("onIs24HoursChange", e.target.checked);
    setData((a) => {
      return a.map((item) => {
        if (item[dayName]) {
          return e.target.checked
            ? {
                ...item,
                [dayName]: { ...item[dayName], open24Hours: e.target.checked },
              }
            : {
                ...item,
                [dayName]: { ...item[dayName], open24Hours: e.target.checked },
              };
        }
        return item;
      });
    });
    // setData((a) =>
    //   e.target.checked
    //     ? [
    //         ...a,
    //         {
    //           [dayName]: {
    //             openHour: "00:00",
    //             closeHour: "00:00",
    //             open24Hours: true,
    //           },
    //         },
    //       ]
    //     : a.filter((item) => !item[dayName])
    // );
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontWeight: "bold", padding: "5px" }}>
          Is your experience only offered during specific hours?
        </h2>
        <p style={{ padding: "5px" }}>
          Your travellers will be able to see this information on their ticket
          once they have booked the experience
        </p>
      </div>

      <div style={{ width: "70%" }}>
        <h5>Enable operating hours</h5>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showDefaultOperatingHours}
                onChange={() => setShowDefaultOperatingHours((prev) => !prev)}
              />
            }
            label="Show operating hours for this experience in your product pages"
          />
        </FormGroup>
      </div>

      {showDefaultOperatingHours && (
        <div
          style={{
            width: "90%",
            border: "1px solid #DEE3EA",
            borderRadius: "7px",
            padding: "20px",
          }}
        >
          <div
            style={{
              padding: "10px",
              background: "#DEE3EA",
              borderBottom: "1px solid black",
              borderRadius: "7px",
            }}
          >
            Default operating hours
          </div>
          <div style={{ padding: "10px", fontStyle: "italic" }}>
            These operating hours are always used, unless you override them with
            seasonal operating hours below.
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => {
                      checkboxOnchange(e, "Monday");
                    }}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Monday)
                          ? true
                          : false
                        : false
                    }
                  />
                }
                label="Monday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Monday)?.Monday?.openHour
                        )
                      : null
                  }
                  onChange={(e) => timeOnchange("Monday", "openHour")(e)}
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item?.Monday) ||
                    data.find((item) => item?.Monday)?.Monday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Monday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Monday)?.Monday?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item?.Monday) ||
                    data.find((item) => item?.Monday)?.Monday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Monday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Monday)?.Monday?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item?.Monday)
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Tuesday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Tuesday)
                          ? true
                          : false
                        : false
                    }
                  />
                }
                label="Tuesday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Tuesday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Tuesday)?.Tuesday?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Tuesday) ||
                    data.find((item) => item.Tuesday)?.Tuesday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Tuesday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Tuesday)?.Tuesday?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Tuesday) ||
                    data.find((item) => item.Tuesday)?.Tuesday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Tuesday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Tuesday)?.Tuesday
                            ?.open24Hours
                          ? true
                          : false
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Tuesday)
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Wednesday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Wednesday)?.Wednesday
                          ? true
                          : false
                        : false
                    }
                  />
                }
                label="Wednesday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Wednesday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Wednesday)?.Wednesday
                            ?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Wednesday) ||
                    data.find((item) => item.Wednesday)?.Wednesday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Wednesday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Wednesday)?.Wednesday
                            ?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Wednesday) ||
                    data.find((item) => item.Wednesday)?.Wednesday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Wednesday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Wednesday)?.Wednesday
                            ?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Wednesday) ||
                      !data.find((item) => item.Wednesday)?.Wednesday
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Thursday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Thursday)?.Thursday
                        : false
                    }
                  />
                }
                label="Thursday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Thursday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Thursday)?.Thursday?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Thursday) ||
                    data.find((item) => item.Thursday)?.Thursday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Thursday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Thursday)?.Thursday
                            ?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Thursday) ||
                    data.find((item) => item.Thursday)?.Thursday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Thursday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Thursday)?.Thursday
                            ?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Thursday) ||
                      !data.find((item) => item.Thursday)?.Thursday
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Friday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Friday)?.Friday
                        : false
                    }
                  />
                }
                label="Friday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Friday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Friday)?.Friday?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Friday) ||
                    data.find((item) => item.Friday)?.Friday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Friday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Friday)?.Friday?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Friday) ||
                    data.find((item) => item.Friday)?.Friday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Friday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Friday)?.Friday?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Friday) ||
                      !data.find((item) => item.Friday)?.Friday
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Saturday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Saturday)?.Saturday
                        : false
                    }
                  />
                }
                label="Saturday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Saturday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Saturday)?.Saturday?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Saturday) ||
                    data.find((item) => item.Saturday)?.Saturday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Saturday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Saturday)?.Saturday
                            ?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Saturday) ||
                    data.find((item) => item.Saturday)?.Saturday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Saturday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Saturday)?.Saturday
                            ?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Saturday) ||
                      !data.find((item) => item.Saturday)?.Saturday
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
          <div
            style={{
              padding: "10px",
              border: "1px solid black",
              borderRadius: "7px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => checkboxOnchange(e, "Sunday")}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Sunday)?.Sunday
                        : false
                    }
                  />
                }
                label="Sunday"
              />
            </FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Sunday", "openHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Sunday)?.Sunday?.openHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Sunday) ||
                    data.find((item) => item.Sunday)?.Sunday?.open24Hours
                  }
                  size="small"
                  label="From"
                />
              </DemoContainer>
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["TimePicker"]}>
                <TimePicker
                  onChange={(e) => timeOnchange("Sunday", "closeHour")(e)}
                  value={
                    data && data.length > 0
                      ? dayjs(
                          data.find((item) => item.Sunday)?.Sunday?.closeHour
                        )
                      : null
                  }
                  disabled={
                    !data ||
                    data.length === 0 ||
                    !data.find((item) => item.Sunday) ||
                    data.find((item) => item.Sunday)?.Sunday?.open24Hours
                  }
                  size="small"
                  label="To"
                />
              </DemoContainer>
            </LocalizationProvider>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) => onIs24HoursChange("Sunday")(e)}
                    checked={
                      data && data.length > 0
                        ? data.find((item) => item.Sunday)?.Sunday?.open24Hours
                        : false
                    }
                    disabled={
                      !data ||
                      data.length === 0 ||
                      !data.find((item) => item.Sunday)
                    }
                  />
                }
                label="Open 24 hours"
              />
            </FormGroup>
          </div>
        </div>
      )}

      <div
        style={{
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
          marginTop: "150px",
        }}
      >
        <Button variant="outlined" onClick={goBack}>
          Back
        </Button>
        <Button variant="contained" onClick={createOpeningHours}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OpeningHours;

// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Checkbox,
//   FormControlLabel,
//   FormGroup,
//   Switch,
//   TextField,
// } from "@mui/material";
// import { useLocation, useNavigate } from "react-router-dom";
// const OpeningHours = () => {
//   const [showDefaultOperatingHours, setShowDefaultOperatingHours] =
//     useState(false);

//   const location = useLocation();
//   const navigate = useNavigate();
//   const { _id } = location.state ? location.state : {};
//   const [experienceId, setExperienceId] = useState("");
//   // const [OpeningHours, setOpeningHours] = useState([]);
//   useEffect(() => {
//     const localId = localStorage.getItem("_id");
//     if (_id) {
//       setExperienceId(_id);
//       return;
//     }
//     if (localId) {
//       setExperienceId(localId);
//       return;
//     }
//     if (!experienceId && experienceId.length === 0) {
//       alert("please add titel and categories");
//       navigate("/titel");
//       return;
//     }
//   });
//   const [openingHours, setOpeningHours] = useState({
//     Monday: { from: new Date(), to: new Date(), open24Hours: false },
//     Tuesday: { from: new Date(), to: new Date(), open24Hours: false },
//     Wednesday: { from: new Date(), to: new Date(), open24Hours: false },
//     Thursday: { from: new Date(), to: new Date(), open24Hours: false },
//     Friday: { from: new Date(), to: new Date(), open24Hours: false },
//     Saturday: { from: new Date(), to: new Date(), open24Hours: false },
//     Sunday: { from: new Date(), to: new Date(), open24Hours: false },
//   });
//   const formatTime = (date) => {
//     return `${date.getHours().toString().padStart(2, "0")}:${date
//       .getMinutes()
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const onDaySelect = (day) => (event) => {
//     setOpeningHours((prevHours) => ({
//       ...prevHours,
//       [day]: {
//         ...prevHours[day],
//         selected: event.target.checked,
//       },
//     }));
//   };

//   // const handleTimeChange = (day, field) => (time) => {
//   //   console.log(time, day, field, "timechange");
//   //   setOpeningHours((prevHours) => ({
//   //     ...prevHours,
//   //     [day]: {
//   //       ...prevHours[day],
//   //       [field]: time,
//   //     },
//   //   }));
//   // };
//   const handleTimeChange = (day, field) => (time) => {
//     console.log(time, day, field, "timechange");

//     setOpeningHours((prevHours) => ({
//       ...prevHours,
//       [day]: {
//         ...prevHours[day],
//         [field]: time,
//       },
//     }));
//   };
//   const [data, setData] = useState([]);

//   const checkboxOnchange = (dayName) => (e) => {
//     const check = e.target.checked;
//     setData((a) =>
//       check
//         ? [...a, { [dayName]: { from: "00:00", to: "00:00" } }]
//         : a.filter((item) => !item[dayName])
//     );
//   };

//   const timeOnchange = (dayName, type) => (time) => {
//     setData((a) =>
//       a.map((item) =>
//         item[dayName] ? { [dayName]: { ...item[dayName], [type]: time } } : item
//       )
//     );
//   };

//   const createOpeningHours = async () => {
//     if (showDefaultOperatingHours) {
//       navigate("/timeDatePass", {
//         state: {
//           ...responseJson,
//         },
//       });
//       return;
//     }
//     const formattedAvailability = [];
//     Object.keys(openingHours).forEach((day) => {
//       const { selected, open24Hours, from, to } = openingHours[day];
//       if (selected) {
//         const availabilityData = {
//           day,
//           isOpen: !open24Hours || (from && to),
//           is24Hours: open24Hours,
//           openHour: open24Hours ? undefined : from.getHours(),
//           closeHour: open24Hours ? undefined : to.getHours(),
//         };
//         formattedAvailability.push(availabilityData);
//       }
//     });
//     //availability_detail
//     const data = {
//       availability_detail: formattedAvailability,
//     };
//     const response = await fetch(`https://demo.turangh.com/experience/${_id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });
//     const responseJson = await response.json();
//     if (!response.ok) {
//       alert(responseJson.error);
//       return;
//     }
//     navigate("/timeDatePass", {
//       state: {
//         ...responseJson,
//       },
//     });
//   };

//   return (
//     // <div>
//     //   {/* Your existing code */}
//     //   {/* ... */}

//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: "20px",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           padding: "20px",
//           marginBottom: "30px",
//         }}
//       >
//         <h2 style={{ fontWeight: "bold", padding: "5px" }}>
//           Is your experience only offered during specific hours?
//         </h2>
//         <p style={{ padding: "5px" }}>
//           Your travellers will be able to see this information on their ticket
//           once they have booked the experience
//         </p>
//       </div>

//       <div style={{ width: "70%" }}>
//         <h5>Enable operating hours</h5>
//         <FormGroup>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={showDefaultOperatingHours}
//                 onChange={() => setShowDefaultOperatingHours((prev) => !prev)}
//               />
//             }
//             label="Show operating hours for this experience in your product pages"
//           />
//         </FormGroup>
//       </div>

//       {showDefaultOperatingHours && (
//         <div
//           style={{
//             width: "90%",
//             border: "1px solid #DEE3EA",
//             borderRadius: "7px",
//             padding: "20px",
//           }}
//         >
//           <div
//             style={{
//               padding: "10px",
//               background: "#DEE3EA",
//               borderBottom: "1px solid black",
//               borderRadius: "7px",
//             }}
//           >
//             Default operating hours
//           </div>
//           <div style={{ padding: "10px", fontStyle: "italic" }}>
//             These operating hours are always used, unless you override them with
//             seasonal operating hours below.
//           </div>
//           <div
//             style={{
//               padding: "10px",
//               border: "1px solid black",
//               borderRadius: "7px",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginTop: "10px",
//               flexDirection: "column",
//             }}
//           >
//             {Object.keys(openingHours).map((day) => (
//               <div
//                 key={day}
//                 style={{
//                   width: "80%",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   padding: "10px",
//                   //border: "1px solid black",
//                   //borderRadius: "7px",
//                   marginTop: "10px",
//                   //flexDirection: "column",
//                   gap: "10px",
//                   //background: "#DEE3EA",
//                   //  color: "black",
//                   fontWeight: "bold",
//                   fontSize: "14px",
//                   textAlign: "center",
//                   //marginBottom: "10px",
//                   //cursor: "pointer",
//                   transition: "background-color 0.3s ease",
//                 }}
//               >
//                 <FormGroup>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={openingHours[day].selected}
//                         onChange={onDaySelect(day)}
//                       />
//                     }
//                     label={day}
//                   />
//                   <TextField
//                     label="From"
//                     value={formatTime(openingHours[day].from)}
//                     onChange={handleTimeChange(day, "from")}
//                   />
//                   <TextField
//                     label="To"
//                     value={formatTime(openingHours[day].to)}
//                     onChange={handleTimeChange(day, "to")}
//                   />{" "}
//                 </FormGroup>
//                 <FormGroup>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={openingHours[day].open24Hours}
//                         onChange={(event) =>
//                           handleTimeChange(
//                             day,
//                             "open24Hours"
//                           )(event.target.checked)
//                         }
//                       />
//                     }
//                     label="Open 24 hours"
//                   />
//                 </FormGroup>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div
//         style={{
//           width: "70%",
//           display: "flex",
//           justifyContent: "space-between",
//           marginTop: "150px",
//         }}
//       >
//         <Button variant="outlined">Back</Button>
//         <Button variant="contained" onClick={createOpeningHours}>
//           Continue
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default OpeningHours;
