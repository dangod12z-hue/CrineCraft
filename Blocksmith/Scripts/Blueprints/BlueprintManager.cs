using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Serialization;
using Blocksmith.World;

namespace Blocksmith.Blueprints
{
    [Serializable]
    public class Blueprint
    {
        public List<int> positions; // x,y,z triples relative to origin
        public List<ushort> blockIds;
    }

    public static class BlueprintManager
    {
        public static Blueprint Capture(Chunk chunk, Vector3Int min, Vector3Int max)
        {
            var bp = new Blueprint { positions = new List<int>(), blockIds = new List<ushort>() };
            for (int x = min.x; x <= max.x; x++)
            for (int y = min.y; y <= max.y; y++)
            for (int z = min.z; z <= max.z; z++)
            {
                var b = chunk.GetBlock(x, y, z);
                if (b.IsAir) continue;
                bp.positions.Add(x - min.x); bp.positions.Add(y - min.y); bp.positions.Add(z - min.z);
                bp.blockIds.Add((ushort)b.Id);
            }
            return bp;
        }

        public static void Save(Blueprint bp, string path)
        {
            var json = JsonUtility.ToJson(bp, true);
            File.WriteAllText(path, json);
        }

        public static Blueprint Load(string path)
        {
            var json = File.ReadAllText(path);
            return JsonUtility.FromJson<Blueprint>(json);
        }

        public static void Place(Blueprint bp, Chunk chunk, Vector3Int origin, int rotationY, bool mirrorX, int scale)
        {
            if (scale <= 0) scale = 1;
            Quaternion rot = Quaternion.Euler(0, rotationY, 0);
            for (int i = 0; i < bp.blockIds.Count; i++)
            {
                int px = bp.positions[i * 3 + 0];
                int py = bp.positions[i * 3 + 1];
                int pz = bp.positions[i * 3 + 2];
                Vector3 v = new Vector3(px, py, pz);
                if (mirrorX) v.x = -v.x;
                v = rot * v;
                Vector3Int dst = origin + new Vector3Int(Mathf.RoundToInt(v.x), Mathf.RoundToInt(v.y), Mathf.RoundToInt(v.z)) * scale;
                if (Chunk.InBounds(dst.x, dst.y, dst.z))
                {
                    chunk.SetBlock(dst.x, dst.y, dst.z, new Block { Id = (BlockId)bp.blockIds[i] });
                }
            }
        }
    }
}