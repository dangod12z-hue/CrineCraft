using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.Items
{
    public class FurnaceStation : MonoBehaviour
    {
        public bool TrySmelt(List<string> inputs, out string outId, out int count)
        {
            return CraftingSystem.TryCraft(inputs, RecipeType.Smelting, out outId, out count);
        }
    }

    public class EnchantingStation : MonoBehaviour
    {
        public bool TryEnchant(List<string> inputs, out string outId, out int count)
        {
            return CraftingSystem.TryCraft(inputs, RecipeType.Enchanting, out outId, out count);
        }
    }

    public class BrewingStation : MonoBehaviour
    {
        public bool TryBrew(List<string> inputs, out string outId, out int count)
        {
            return CraftingSystem.TryCraft(inputs, RecipeType.Brewing, out outId, out count);
        }
    }
}