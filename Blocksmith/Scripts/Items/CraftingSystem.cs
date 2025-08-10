using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Blocksmith.Items
{
    public enum RecipeType { Crafting, Smelting, Enchanting, Brewing }

    public class Recipe
    {
        public string id;
        public RecipeType type;
        public List<string> inputs;
        public string output;
        public int count = 1;
    }

    public static class RecipeBook
    {
        private static readonly List<Recipe> _recipes = new();

        public static void Add(Recipe r) => _recipes.Add(r);
        public static IEnumerable<Recipe> All => _recipes;

        public static IEnumerable<Recipe> FindByInputs(IEnumerable<string> inputIds, RecipeType type)
        {
            var set = new HashSet<string>(inputIds);
            return _recipes.Where(r => r.type == type && r.inputs.All(i => set.Contains(i)));
        }
    }

    public static class CraftingSystem
    {
        public static bool TryCraft(IEnumerable<string> inputIds, RecipeType type, out string outputId, out int count)
        {
            var r = RecipeBook.FindByInputs(inputIds, type).FirstOrDefault();
            if (r != null)
            {
                outputId = r.output; count = r.count; return true;
            }
            outputId = null; count = 0; return false;
        }
    }
}