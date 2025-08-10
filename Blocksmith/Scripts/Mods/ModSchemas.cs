using System;
using System.Collections.Generic;

namespace Blocksmith.Mods
{
    [Serializable]
    public class ModManifest
    {
        public string modId;
        public string displayName;
        public string version;
        public List<BlockDef> blocks;
        public List<ItemDef> items;
        public List<MobDef> mobs;
        public List<RecipeDef> recipes;
    }

    [Serializable]
    public class BlockDef { public string id; public string displayName; public bool solid; public bool redstone; }

    [Serializable]
    public class ItemDef { public string id; public string displayName; public string type; public int maxStack = 64; }

    [Serializable]
    public class MobDef { public string id; public string displayName; public bool hostile; public float health = 20f; }

    [Serializable]
    public class RecipeDef { public string id; public string type; public string[] inputs; public string output; public int count = 1; }
}