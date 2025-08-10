using UnityEngine;

namespace Blocksmith.World
{
    public class Portal : MonoBehaviour
    {
        public DimensionId TargetDimension;

        private void OnTriggerEnter(Collider other)
        {
            // Switch dimension: implementation specific to scene management
            // Placeholder: log action
            Debug.Log($"Entering portal to {TargetDimension}");
        }
    }
}