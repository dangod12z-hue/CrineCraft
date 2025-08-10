#if NGO
using Unity.Netcode;
using UnityEngine;

namespace Blocksmith.Networking
{
    public class NetworkBootstrap : MonoBehaviour
    {
        public bool startHost;
        public bool startClient;

        private void Start()
        {
            if (startHost) NetworkManager.Singleton.StartHost();
            else if (startClient) NetworkManager.Singleton.StartClient();
        }
    }
}
#endif