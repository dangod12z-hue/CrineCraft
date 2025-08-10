using System;
using System.Collections.Generic;
using UnityEngine;

namespace Blocksmith.Redstone
{
    /// <summary>
    /// Programmable block allowing simple expressions over input channels to produce outputs.
    /// Syntax example: "out0 = in0 && !in1; out1 = (in2 || in3) && !in4;".
    /// Custom safe parser, no dynamic code execution.
    /// </summary>
    public class ProgrammableBlock : RedstoneNodeBehaviour, IRedstoneProvider
    {
        [TextArea(3, 6)] public string program = "out0 = in0;";

        public RedstoneSignalBundle GetOutput(RedstoneSignalBundle[] neighborBundles)
        {
            var outBundle = RedstoneSignalBundle.CreateOff();
            bool[] inputs = new bool[16];
            for (int i = 0; i < 16; i++)
            {
                bool on = false;
                foreach (var n in neighborBundles) if (n.Channels[i].Strength > 0 || n.Channels[i].IsBoosted) { on = true; break; }
                inputs[i] = on;
            }
            bool[] outputs = Evaluate(program, inputs);
            for (int i = 0; i < 16 && i < outputs.Length; i++)
            {
                outBundle.Channels[i].Strength = (byte)(outputs[i] ? 15 : 0);
            }
            return outBundle;
        }

        private static bool[] Evaluate(string program, bool[] inputs)
        {
            bool[] outputs = new bool[16];
            string[] statements = (program ?? string.Empty).Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var stmt in statements)
            {
                var s = stmt.Trim();
                if (!s.StartsWith("out")) continue;
                var parts = s.Split('=');
                if (parts.Length != 2) continue;
                if (!int.TryParse(parts[0].Replace("out", string.Empty).Trim(), out int outIndex)) continue;
                string expr = parts[1];
                try
                {
                    bool value = EvaluateExpression(expr, inputs);
                    if (outIndex >= 0 && outIndex < outputs.Length) outputs[outIndex] = value;
                }
                catch { }
            }
            return outputs;
        }

        private static bool EvaluateExpression(string expr, bool[] inputs)
        {
            var tokens = Tokenize(expr);
            var rpn = ToRpn(tokens);
            return EvalRpn(rpn, inputs);
        }

        private enum TokType { Var, True, False, And, Or, Not, LParen, RParen }
        private struct Tok { public TokType Type; public int VarIndex; }

        private static List<Tok> Tokenize(string expr)
        {
            var tokens = new List<Tok>();
            int i = 0; expr = expr ?? string.Empty;
            while (i < expr.Length)
            {
                char c = expr[i];
                if (char.IsWhiteSpace(c)) { i++; continue; }
                if (c == '(') { tokens.Add(new Tok { Type = TokType.LParen }); i++; continue; }
                if (c == ')') { tokens.Add(new Tok { Type = TokType.RParen }); i++; continue; }
                if (c == '!') { tokens.Add(new Tok { Type = TokType.Not }); i++; continue; }
                if (i + 1 < expr.Length && expr.Substring(i, 2) == "&&") { tokens.Add(new Tok { Type = TokType.And }); i += 2; continue; }
                if (i + 1 < expr.Length && expr.Substring(i, 2) == "||") { tokens.Add(new Tok { Type = TokType.Or }); i += 2; continue; }
                if (i + 4 <= expr.Length && string.Compare(expr, i, "true", 0, 4, true) == 0) { tokens.Add(new Tok { Type = TokType.True }); i += 4; continue; }
                if (i + 5 <= expr.Length && string.Compare(expr, i, "false", 0, 5, true) == 0) { tokens.Add(new Tok { Type = TokType.False }); i += 5; continue; }
                if (i + 2 <= expr.Length && string.Compare(expr, i, "in", 0, 2, true) == 0)
                {
                    i += 2; int start = i;
                    while (i < expr.Length && char.IsDigit(expr[i])) i++;
                    if (int.TryParse(expr.Substring(start, i - start), out int idx) && idx >= 0 && idx < 16)
                    {
                        tokens.Add(new Tok { Type = TokType.Var, VarIndex = idx }); continue;
                    }
                }
                // Unknown token: skip
                i++;
            }
            return tokens;
        }

        private static List<Tok> ToRpn(List<Tok> tokens)
        {
            var output = new List<Tok>();
            var ops = new Stack<Tok>();
            int Prec(TokType t) => t == TokType.Not ? 3 : t == TokType.And ? 2 : t == TokType.Or ? 1 : 0;
            bool RightAssoc(TokType t) => t == TokType.Not;

            foreach (var tok in tokens)
            {
                switch (tok.Type)
                {
                    case TokType.Var:
                    case TokType.True:
                    case TokType.False:
                        output.Add(tok); break;
                    case TokType.Not:
                    case TokType.And:
                    case TokType.Or:
                        while (ops.Count > 0 && ops.Peek().Type != TokType.LParen &&
                               (Prec(ops.Peek().Type) > Prec(tok.Type) || (Prec(ops.Peek().Type) == Prec(tok.Type) && !RightAssoc(tok.Type))))
                        {
                            output.Add(ops.Pop());
                        }
                        ops.Push(tok); break;
                    case TokType.LParen:
                        ops.Push(tok); break;
                    case TokType.RParen:
                        while (ops.Count > 0 && ops.Peek().Type != TokType.LParen) output.Add(ops.Pop());
                        if (ops.Count > 0 && ops.Peek().Type == TokType.LParen) ops.Pop();
                        break;
                }
            }
            while (ops.Count > 0) output.Add(ops.Pop());
            return output;
        }

        private static bool EvalRpn(List<Tok> rpn, bool[] inputs)
        {
            var st = new Stack<bool>();
            foreach (var tok in rpn)
            {
                switch (tok.Type)
                {
                    case TokType.Var: st.Push(inputs[tok.VarIndex]); break;
                    case TokType.True: st.Push(true); break;
                    case TokType.False: st.Push(false); break;
                    case TokType.Not: st.Push(!st.Pop()); break;
                    case TokType.And: { var b = st.Pop(); var a = st.Pop(); st.Push(a && b); } break;
                    case TokType.Or: { var b = st.Pop(); var a = st.Pop(); st.Push(a || b); } break;
                }
            }
            return st.Count > 0 && st.Pop();
        }
    }
}