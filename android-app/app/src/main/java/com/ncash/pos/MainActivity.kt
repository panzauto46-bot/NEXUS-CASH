package com.ncash.pos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.ncash.pos.ui.NCashPosApp
import com.ncash.pos.ui.theme.NCashTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NCashTheme {
                NCashPosApp()
            }
        }
    }
}
