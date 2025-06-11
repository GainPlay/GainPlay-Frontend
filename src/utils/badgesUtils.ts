import { FrontendBadge } from "@/types/index"

export const rarityColors = {
    common: "bg-gray-100 text-gray-700 border-gray-300",
    rare: "bg-blue-100 text-blue-700 border-blue-300",
    epic: "bg-purple-100 text-purple-700 border-purple-300",
    legendary: "bg-yellow-100 text-yellow-700 border-yellow-300",
};
  
// Function to determine badge rarity based on badge properties
  // You can customize this logic based on your badge system
  export const getBadgeRarity = (badge: FrontendBadge): keyof typeof rarityColors => {
    // Default rarity assignment - you can modify this based on your badge structure
    const badgeName = badge.name.toLowerCase();
    
    if (badgeName.includes("first") || badgeName.includes("early") || badgeName.includes("social")) {
      return "common";
    } else if (badgeName.includes("master") || badgeName.includes("crusher") || badgeName.includes("king")) {
      return "rare";
    } else if (badgeName.includes("iron") || badgeName.includes("high") || badgeName.includes("endurance")) {
      return "epic";
    } else if (badgeName.includes("guru") || badgeName.includes("perfectionist")) {
      return "legendary";
    }
    
    return "common"; // default
  };

//   export 