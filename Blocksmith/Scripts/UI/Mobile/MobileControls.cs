using UnityEngine;

namespace Blocksmith.UI.Mobile
{
    public class MobileControls : MonoBehaviour
    {
        [SerializeField] private GameObject mobileRoot;

        private void Start()
        {
            bool isMobile = Application.isMobilePlatform;
            if (mobileRoot != null) mobileRoot.SetActive(isMobile);
        }
    }
}