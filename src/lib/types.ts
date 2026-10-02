export type Retailer = "skroutz" | "jumbo" | "other";
export type Birthday = {id:string;slug:string;childName:string;birthdayDate:string;partyDate:string;startTime:string;invitationText:string;locationText:string;mapsUrl:string|null;phone:string|null;childImageUrl:string|null;adminSecret:string;createdAt:string;updatedAt:string};
export type Gift = {id:string;birthdayId:string;title:string;url:string;imageUrl:string|null;priceText:string|null;retailer:Retailer;sortOrder:number;claimedAt:string|null;claimedByEmail?:string|null;createdAt:string;updatedAt:string};
export type PublicGift = Omit<Gift,"claimedByEmail">;
export type PublicBirthday = Omit<Birthday,"adminSecret">;
