using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Blocksmith.Core;

namespace Blocksmith.Mods
{
    public class ModLoader : MonoBehaviour
    {
        public List<ModManifest> LoadedMods { get; private set; } = new();

        private void Start()
        {
            string dir = Path.Combine(Application.streamingAssetsPath, "Mods");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            foreach (var file in Directory.GetFiles(dir, "*.json"))
            {
                try
                {
                    var json = File.ReadAllText(file);
                    var manifest = JsonUtility.FromJson<ModManifest>(json);
                    if (manifest != null)
                    {
                        LoadedMods.Add(manifest);
                        Register(manifest);
                    }
                }
                catch (System.Exception ex)
                {
                    Debug.LogError($"Failed to load mod {file}: {ex}");
                }
            }
        }

        private void Register(ModManifest mod)
        {
            if (mod.blocks != null) foreach (var b in mod.blocks) Registry.Register(nameof(Registry.Blocks), b.id, b);
            if (mod.items != null) foreach (var i in mod.items) Registry.Register(nameof(Registry.Items), i.id, i);
            if (mod.mobs != null) foreach (var m in mod.mobs) Registry.Register(nameof(Registry.Mobs), m.id, m);
            if (mod.recipes != null) foreach (var r in mod.recipes) Registry.Register(nameof(Registry.Recipes), r.id, r);
        }
    }
}