import {jwtDecode} from "jwt-decode";
export const getUserFromToken = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;
  
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const role =
        decodedPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || "User"; // Podrazumevana uloga je "User"
      return { role }; // Vraćamo samo ulogu
    } catch (error) {
      console.error("Greška prilikom dekodiranja tokena:", error);
      return null;
    }
  };
  