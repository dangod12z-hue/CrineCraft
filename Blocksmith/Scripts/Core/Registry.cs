using System;
using System.Collections.Generic;

namespace Blocksmith.Core
{
    /// <summary>
    /// Global registries for content. Backed by dictionaries for mod extensibility.
    /// </summary>
    public static class Registry
    {
        public static readonly Dictionary<string, object> Blocks = new();
        public static readonly Dictionary<string, object> Items = new();
        public static readonly Dictionary<string, object> Recipes = new();
        public static readonly Dictionary<string, object> Mobs = new();
        public static readonly Dictionary<string, object> Dimensions = new();

        public static void Register(string category, string id, object data)
        {
            var dict = GetDict(category);
            dict[id] = data;
        }

        public static T Get<T>(string category, string id) where T : class
        {
            var dict = GetDict(category);
            return dict.TryGetValue(id, out var obj) ? obj as T : null;
        }

        private static Dictionary<string, object> GetDict(string category)
        {
            return category switch
            {
                nameof(Blocks) => Blocks,
                nameof(Items) => Items,
                nameof(Recipes) => Recipes,
                nameof(Mobs) => Mobs,
                nameof(Dimensions) => Dimensions,
                _ => throw new ArgumentOutOfRangeException(nameof(category), category, null)
            };
        }
    }
}