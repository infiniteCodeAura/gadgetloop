

export const loginIp = async(payload)=>{

    

    let device ;

    try {
      const url = `${process.env.ipKey}${payload}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).json({ message: "Something went wrong." });
    }
    // console.log("object");
    const jsonData = await response.json();

    device = jsonData;

} catch (error) {
        
    }

  if (device.status === "fail") {
    device = {};
  }
    
return device;


}



