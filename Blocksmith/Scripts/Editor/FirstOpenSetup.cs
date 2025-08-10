#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Blocksmith.EditorTools
{
    [InitializeOnLoad]
    public static class FirstOpenSetup
    {
        static FirstOpenSetup()
        {
            if (!System.IO.File.Exists("Assets/Scenes/Bootstrap.unity"))
            {
                var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
                var go = new GameObject("Systems");
                go.AddComponent<Blocksmith.World.WorldManager>();
                go.AddComponent<Blocksmith.World.ChunkLoader>();
                go.AddComponent<Blocksmith.Mods.ModLoader>();
                EditorSceneManager.SaveScene(scene, "Assets/Scenes/Bootstrap.unity");
                AssetDatabase.SaveAssets();
            }
        }
    }
}
#endif