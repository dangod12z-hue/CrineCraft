using UnityEngine;

namespace Blocksmith.UI
{
    public class InventoryUI : MonoBehaviour
    {
        [SerializeField] private GameObject root;

        public void Show(bool show)
        {
            if (root != null) root.SetActive(show);
        }
    }
}