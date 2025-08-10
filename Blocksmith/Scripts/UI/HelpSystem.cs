using UnityEngine;

namespace Blocksmith.UI
{
    public class HelpSystem : MonoBehaviour
    {
        [TextArea(4,10)] public string helpText = "Welcome to Blocksmith. Use inventory search and recipes guide.";

        public void Show()
        {
            Debug.Log(helpText);
        }
    }
}