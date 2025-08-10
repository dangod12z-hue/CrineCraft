using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;

namespace Blocksmith.Items
{
    [System.Serializable]
    public class RecipeFile
    {
        public Recipe[] recipes;
    }

    public static class RecipeLoader
    {
        private static readonly Dictionary<string, Recipe> _index = new();

        public static void LoadAll()
        {
            string dir = Path.Combine(Application.streamingAssetsPath, "Recipes");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            foreach (var file in Directory.GetFiles(dir, "*.json"))
            {
                try
                {
                    var json = File.ReadAllText(file);
                    var container = JsonUtility.FromJson<RecipeFile>(json);
                    if (container?.recipes == null) continue;
                    foreach (var r in container.recipes)
                    {
                        RecipeBook.Add(r);
                        string key = KeyFor(r.inputs, r.type);
                        _index[key] = r;
                    }
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed loading recipes {file}: {ex}");
                }
            }
        }

        public static bool TryFind(IEnumerable<string> inputs, RecipeType type, out Recipe recipe)
        {
            string key = KeyFor(inputs, type);
            return _index.TryGetValue(key, out recipe);
        }

        private static string KeyFor(IEnumerable<string> inputs, RecipeType type)
        {
            var sorted = inputs.OrderBy(x => x).ToArray();
            return type + ":" + string.Join(",", sorted);
        }
    }
}