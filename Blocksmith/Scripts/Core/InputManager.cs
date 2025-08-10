using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace Blocksmith.Core
{
    public class InputManager : MonoBehaviour
    {
#if ENABLE_INPUT_SYSTEM
        public InputActionAsset actions;
        public void Rebind(string actionName, System.Action onComplete)
        {
            var action = actions?.FindAction(actionName);
            if (action == null) { onComplete?.Invoke(); return; }
            action.Disable();
            var rebind = action.PerformInteractiveRebinding();
            rebind.OnComplete(op => { op.Dispose(); action.Enable(); onComplete?.Invoke(); });
            rebind.Start();
        }
#else
        public void Rebind(string actionName, System.Action onComplete) { onComplete?.Invoke(); }
#endif
    }
}