export const loginIp = async (payload) => {
  let device;

  try {
    const url = `${process.env.ipKey}${payload}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log("Something went wrong");
    }
    const jsonData = await response.json();

    device = jsonData;
  } catch (error) {}

  if (device.status === "fail") {
    device = {};
  }

  return device;
};
