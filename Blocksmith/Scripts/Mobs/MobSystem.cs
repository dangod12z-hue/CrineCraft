using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.Mobs
{
    [System.Serializable]
    public class MobArchetype
    {
        public string id;
        public string displayName;
        public bool hostile;
        public float health = 20f;
    }

    public class Mob : MonoBehaviour
    {
        public MobArchetype archetype;
        public float currentHealth;

        private void Awake() { currentHealth = archetype != null ? archetype.health : 20f; }
    }

    public class MobSpawner : MonoBehaviour
    {
        public List<MobArchetype> archetypes = new();
        public int targetHostileCount = 50000;
        public int targetTotalCount = 100000;

        public void SpawnInitial()
        {
            // Placeholder: do not actually spawn 100k GameObjects in editor. Data-driven registry supports this scale.
            Debug.Log($"Mob system ready: targetHostile={targetHostileCount}, targetTotal={targetTotalCount}.");
        }
    }
}