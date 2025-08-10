using System.Collections.Generic;

namespace Blocksmith.World
{
    public enum DimensionId
    {
        Overworld,
        Nether,
        End,
        Aether,
        DeepCaves,
        SkyIsles,
        CrystalVoid
    }

    public class Dimension
    {
        public DimensionId Id;
        public string DisplayName;
        public int SeedOffset;
    }

    public static class DimensionManager
    {
        public static readonly Dictionary<DimensionId, Dimension> Dimensions = new()
        {
            { DimensionId.Overworld, new Dimension{ Id=DimensionId.Overworld, DisplayName="Overworld", SeedOffset=0 } },
            { DimensionId.Nether, new Dimension{ Id=DimensionId.Nether, DisplayName="Nether", SeedOffset=1000 } },
            { DimensionId.End, new Dimension{ Id=DimensionId.End, DisplayName="End", SeedOffset=2000 } },
            { DimensionId.Aether, new Dimension{ Id=DimensionId.Aether, DisplayName="Aether", SeedOffset=3000 } },
            { DimensionId.DeepCaves, new Dimension{ Id=DimensionId.DeepCaves, DisplayName="Deep Caves", SeedOffset=4000 } },
            { DimensionId.SkyIsles, new Dimension{ Id=DimensionId.SkyIsles, DisplayName="Sky Isles", SeedOffset=5000 } },
            { DimensionId.CrystalVoid, new Dimension{ Id=DimensionId.CrystalVoid, DisplayName="Crystal Void", SeedOffset=6000 } },
        };

        public static Dimension Get(DimensionId id) => Dimensions[id];
    }
}