using UnityEngine;

namespace Blocksmith.World
{
    [CreateAssetMenu(menuName = "Blocksmith/World/Performance Settings")]
    public class ProfilerSettings : ScriptableObject
    {
        [Range(2, 16)] public int maxViewDistance = 8;
        [Range(1, 64)] public int maxChunkBuildsPerFrame = 8;
    }
}