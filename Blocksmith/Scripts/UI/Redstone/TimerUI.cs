using UnityEngine;
using UnityEngine.UI;

namespace Blocksmith.UI.Redstone
{
    public class TimerUI : MonoBehaviour
    {
        [SerializeField] private Slider slider;
        [SerializeField] private Blocksmith.Redstone.RedstoneTimer timer;
        [SerializeField] private Text valueText;

        private void Start()
        {
            if (slider != null)
            {
                slider.minValue = 1; slider.maxValue = 10000; slider.wholeNumbers = true;
                slider.value = timer != null ? timer.intervalMs : 500;
                slider.onValueChanged.AddListener(OnChanged);
                UpdateLabel();
            }
        }

        private void OnChanged(float v)
        {
            if (timer != null) timer.intervalMs = Mathf.RoundToInt(v);
            UpdateLabel();
        }

        private void UpdateLabel()
        {
            if (valueText != null && timer != null) valueText.text = timer.intervalMs + " ms";
        }
    }
}