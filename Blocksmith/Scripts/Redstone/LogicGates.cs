using UnityEngine;

namespace Blocksmith.Redstone
{
    public abstract class LogicGateBase : RedstoneNodeBehaviour, IRedstoneProvider
    {
        public abstract bool Compute(bool a, bool b);

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            for (int i = 0; i < 16; i++)
            {
                byte a = neighborBundles.Length > 0 ? neighborBundles[0].Channels[i].Strength : (byte)0;
                byte b = neighborBundles.Length > 1 ? neighborBundles[1].Channels[i].Strength : (byte)0;
                bool res = Compute(a > 0, b > 0);
                outBundle.Channels[i].Strength = (byte)(res ? 15 : 0);
            }
            return outBundle;
        }
    }

    public class AndGate : LogicGateBase { public override bool Compute(bool a, bool b) => a && b; }
    public class OrGate  : LogicGateBase { public override bool Compute(bool a, bool b) => a || b; }
    public class NotGate : MonoBehaviour, IRedstoneProvider
    {
        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            for (int i = 0; i < 16; i++)
            {
                byte a = neighborBundles.Length > 0 ? neighborBundles[0].Channels[i].Strength : (byte)0;
                outBundle.Channels[i].Strength = (byte)(a > 0 ? 0 : 15);
            }
            return outBundle;
        }
    }
    public class XorGate : LogicGateBase { public override bool Compute(bool a, bool b) => a ^ b; }
    public class NandGate: LogicGateBase { public override bool Compute(bool a, bool b) => !(a && b); }
    public class NorGate : LogicGateBase { public override bool Compute(bool a, bool b) => !(a || b); }
    public class XnorGate: LogicGateBase { public override bool Compute(bool a, bool b) => !(a ^ b); }
}