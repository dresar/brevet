-- SQL IMPORT SCRIPT UNTUK NEON DATABASE EDITOR (BREVET GEMINI KEYS)
-- Salin dan jalankan query ini di Neon SQL Editor / pgAdmin

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gemini',
  status TEXT NOT NULL DEFAULT 'active',
  order_index INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

DELETE FROM api_keys WHERE provider = 'gemini';

-- Insert 92 Gemini Pool Keys:
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 01', 'AQ.Ab8RN6J-iId3gcTiyKL2ZBHHUrHgo-tZuQT7XUzxmCNnDgnH6g', 'gemini', 'active', 0, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 02', 'AQ.Ab8RN6LxQ4QKnl2kNCmk_MbCYyAYpmeOPDq2SrVBxGciW661KQ', 'gemini', 'active', 1, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 03', 'AQ.Ab8RN6JgYfn25M5k1B3tty_qkvPVJTOnjdAnjzTcmkZ52iBHxg', 'gemini', 'active', 2, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 04', 'AQ.Ab8RN6Lt-y29C9a5Z94r9Nanv0QJ4texN_QhCAcPFKSDGOPnbw', 'gemini', 'active', 3, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 05', 'AQ.Ab8RN6IcIg_VvOCMJuH-V5gv9KovWzvjFS98HjrSPHdUrKgFMw', 'gemini', 'active', 4, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 06', 'AQ.Ab8RN6ICecdQiZ7Vha-S5ob-TC6bWX3nevxkZGNF3_M7WNIgXA', 'gemini', 'active', 5, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 07', 'AQ.Ab8RN6KD3EUblxJwkJILi2fOuquP2RdX_M1tBiJliiAq8KdMHg', 'gemini', 'active', 6, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 08', 'AQ.Ab8RN6JyayEmC1S9Cv6BVdSf_I2fHTKsYWg80FqktMt6fDna0A', 'gemini', 'active', 7, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 09', 'AQ.Ab8RN6KiddT5Lq8aGfuo41to3j25oN48Oi6DxP0mdL5lsVtflg', 'gemini', 'active', 8, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 10', 'AQ.Ab8RN6L7zg7UX9ZhecSqyec5-0JVUmely0q5YxWCuwbfFly5EQ', 'gemini', 'active', 9, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 11', 'AQ.Ab8RN6Lzi_rfwcVLFipZXd7BHYvC0aBJwv9bJ_rbaUH5u14EHg', 'gemini', 'active', 10, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 12', 'AQ.Ab8RN6IBODaSwAiskMcs-H3nv441pSQyeYIbBQbt9WYKqhZgZw', 'gemini', 'active', 11, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 13', 'AQ.Ab8RN6KZ3JAfbcCJr2TV2s8RE6A13RuZ-NJxAONzUny2SuUTfg', 'gemini', 'active', 12, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 14', 'AQ.Ab8RN6LXXvNoHccqTALl0cdCX2wL6ekjY5LUAG0xdbo02Q67Ow', 'gemini', 'active', 13, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 15', 'AQ.Ab8RN6JtBGh703m0zL0PlK0IyRCdFfkm5Gz7MnguE0wDlUVdJw', 'gemini', 'active', 14, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 16', 'AQ.Ab8RN6LWbncxO9NPOiRRSCGMwfIn3UptC5mWJTl8LNcgCVfLYQ', 'gemini', 'active', 15, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 17', 'AQ.Ab8RN6IO9S5UR_-bAY_XMug7USdgIfic7BxXKHphOEMmJV5DpA', 'gemini', 'active', 16, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 18', 'AQ.Ab8RN6LKo_n8C0eyZl77n3ewOXXkLajfsjW1qgWcqRO_b6ZQtw', 'gemini', 'active', 17, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 19', 'AQ.Ab8RN6JWvJSmTHxsovgAAbIRRwIviNr76J4yX6uAiD_wToKg_A', 'gemini', 'active', 18, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 20', 'AQ.Ab8RN6IsMm7BheVXVI8pXdgPCgVDnNSkVg77Gzy-N4MBIB_JgQ', 'gemini', 'active', 19, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 21', 'AQ.Ab8RN6IhnnoIkCqvhQaia4tigrE6DkBQ2HfWgMFosqdVRtg1PQ', 'gemini', 'active', 20, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 22', 'AQ.Ab8RN6K4Ci0zoRIi7HDw9O7QjaW3ttLBst9nwTnnKWlZOYdFGQ', 'gemini', 'active', 21, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 23', 'AQ.Ab8RN6L53hN5qu5JYZ3ovPAIJbEM3SVml2qV8M-BiVmq-WLaGg', 'gemini', 'active', 22, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 24', 'AQ.Ab8RN6I37fjxtRxZEBiZqcYeDYSjNHDirYXZej6DetinyCdymw', 'gemini', 'active', 23, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 25', 'AQ.Ab8RN6JMWYMLK_TxCsiqOx2QSaLqGAzIwGMkNqrvwCG64sgLhA', 'gemini', 'active', 24, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 26', 'AQ.Ab8RN6J1m8jhB1WDnsmFAaF-MjCASywc_LJYxyQuqoN0RtFY1w', 'gemini', 'active', 25, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 27', 'AQ.Ab8RN6LAL2ghN7b9ceSs4swJ-vrVbAItZvw4tYtsRf8sFdhtaw', 'gemini', 'active', 26, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 28', 'AQ.Ab8RN6Is9LjJ2JH8G_b9SJI-hJxshjKjD_7h2MUspQg5CcOU3A', 'gemini', 'active', 27, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 29', 'AQ.Ab8RN6KdKOIIu9HdrfyaAdAIjI73gJHgo5Ra4Sx1q0nW-H-63A', 'gemini', 'active', 28, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 30', 'AQ.Ab8RN6LS7rJLBnoC_bXWCfPIniYAEX_xl82hMN0vqQ_oIQTuuA', 'gemini', 'active', 29, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 31', 'AQ.Ab8RN6LvZhWUuyy953oHETuIWWSC395ZIQVucJnlqrJaKrlIKA', 'gemini', 'active', 30, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 32', 'AQ.Ab8RN6JzN8T7F6Fl50_HrPqcmBHqq1AgCoQHXbEa1ZNKxH1sew', 'gemini', 'active', 31, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 33', 'AQ.Ab8RN6J8tQIMDOXGgEvAn6ZxofNmZfer3ND3zaJWhk4XmKd6KQ', 'gemini', 'active', 32, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 34', 'AQ.Ab8RN6IRXCLcd8Pd4bNU9t2QhlJdyl4oJIQFLYhp4peqAX2uJQ', 'gemini', 'active', 33, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 35', 'AQ.Ab8RN6IUYTiiWKycNbb3KYjhw9YGoRe_B_Z_GbdcLI4imd3Tgg', 'gemini', 'active', 34, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 36', 'AQ.Ab8RN6Jv5mArK6BrPoyzbwRSKfNuXTaeHhR_S7mme5M0-ccNjw', 'gemini', 'active', 35, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 37', 'AQ.Ab8RN6IyAY9MB5voi3iZTRgfKyDxG3c3wWkH9JMsp98Whw7RQ', 'gemini', 'active', 36, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 38', 'AQ.Ab8RN6JVuzWmumYvlrA669XK0aiq712UenaIkY3FyyPTQyXtAg', 'gemini', 'active', 37, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 39', 'AQ.Ab8RN6Jh1-H8shx-1TeRX_6KIkRjAhNgWQdbews2fgtV8Mx1AA', 'gemini', 'active', 38, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 40', 'AQ.Ab8RN6L_cbkFoJZPzslLJRoY1ptAF37EXSiTTXfsq18VDYFc4Q', 'gemini', 'active', 39, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 41', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 40, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 42', 'AQ.Ab8RN6KXA9vdMyiCmYEGrrEKG55KImaRh69ItlrDQdllNiBlig', 'gemini', 'active', 41, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 43', 'AQ.Ab8RN6LQAIDqLFkhOodNbbptusgI0vFn1wiCuuepwEZBFRokpg', 'gemini', 'active', 42, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 44', 'AQ.Ab8RN6LPGq-vE4PDH9iFiwMv3lbFVxoig94H_g4aT3bw7gsVyA', 'gemini', 'active', 43, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 45', 'AQ.Ab8RN6KFc5_XCo0bR46hR74iHBZhQho74cSUo5gglV2L5s4c-g', 'gemini', 'active', 44, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 46', 'AQ.Ab8RN6I-_eAR8iPARb9uZF1Wg-2aH6xC0SLOVGLO_R0i8xtn5A', 'gemini', 'active', 45, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 47', 'AQ.Ab8RN6JdTHn52NRhNEehKI8rKbzz0ZR8PKEEWYP4Lv_oiJwbMQ', 'gemini', 'active', 46, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 48', 'AQ.Ab8RN6L2mGUIqrcZ5O5SoEInYg86CKe9o02gcersNuUd7BIO7Q', 'gemini', 'active', 47, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 49', 'AQ.Ab8RN6KjcsHocum0aXBmerIebPl_KKYoXF0KqAIzey06Bo6sLw', 'gemini', 'active', 48, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 50', 'AQ.Ab8RN6LDxHc-FOXlySS-qKyG4S9wAKM4WuyikTP8sfJrLIlN3Q', 'gemini', 'active', 49, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 51', 'AQ.Ab8RN6LsuAUnqng4_xE5iL6IGObpcVx9J2YAJPWFkQUDolv6Vw', 'gemini', 'active', 50, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 52', 'AQ.Ab8RN6Kb7BdEpZ56FegWq7ObQcZzSttJ-Dg3Mp-REPVFcRVHkw', 'gemini', 'active', 51, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 53', 'AQ.Ab8RN6JfRejqgZOYgmwSyiE_4bYB0V1pfw0kmAVIjboCfYcIdg', 'gemini', 'active', 52, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 54', 'AQ.Ab8RN6Kjzz2D2v5XFQ_5SX56A_t4mYFdEDkCM6as6Av6QsJcyQ', 'gemini', 'active', 53, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 55', 'AQ.Ab8RN6IL36VC1pcAJ8Ki8NbFnRpRNeJx9mENQTeV0NJeCD8pfg', 'gemini', 'active', 54, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 56', 'AQ.Ab8RN6LKbgCMzW82yFcLo5htGoGr233wahug3q_JL0AMmLihyw', 'gemini', 'active', 55, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 57', 'AQ.Ab8RN6J-tlhgMaanYH14arc7xy28mZr5LRLc9mYCHCUjvFzfaQ', 'gemini', 'active', 56, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 58', 'AQ.Ab8RN6LiLABf6fvhEr5TXCNlttFa_WOmDlCqxmCOvecAJ7MWtQ', 'gemini', 'active', 57, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 59', 'AQ.Ab8RN6Iaf8Cal2vPdgjtCRS2fWA6Hu89INk_Go58UkGfd3GKUA', 'gemini', 'active', 58, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 60', 'AQ.Ab8RN6LVJ_swlR1wt2rYx51q8HDq01rwAjGhB17NBWnD1vIKvQ', 'gemini', 'active', 59, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 61', 'AQ.Ab8RN6IiAzwzlWm_S__PQhq88S2BgBSfX4BcM4qF_imVfQYSbA', 'gemini', 'active', 60, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 62', 'AQ.Ab8RN6LDRCvXkv-QIbeM7DmkznKlU3QXEHcsobz-GJwWZ1-mhA', 'gemini', 'active', 61, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 63', 'AQ.Ab8RN6JIHuuD0rtjSBp2QJMMu2mu_ZTQ10zcy0lVSO_5AwwfqA', 'gemini', 'active', 62, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 64', 'AQ.Ab8RN6JYpUEdiBzJppKlIOlOZ9p_MJeTNocM0c34adQCQrk2oQ', 'gemini', 'active', 63, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 65', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 64, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 66', 'AQ.Ab8RN6K8QeO_LLElOA1WDLaKH9HBUmD0YfjTDD0fwtSCjm8SLA', 'gemini', 'active', 65, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 67', 'AQ.Ab8RN6LmzcDur1XvfMHCidI91eOIvItv8UKvxcf2G2MNuL0KyQ', 'gemini', 'active', 66, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 68', 'AQ.Ab8RN6L9xP5YC6WBloPTZPACmmdBSjrHPaqphoYgr5K71xj4ag', 'gemini', 'active', 67, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 69', 'AQ.Ab8RN6JfIDGkB8FWt7WB9wxt3giIj18_Gj50NpTiE_jy4F8ZCA', 'gemini', 'active', 68, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 70', 'AQ.Ab8RN6LWAnfsNX4CnqB69j5mYkwP670R9rPuUXFXHt_huNJ1Xw', 'gemini', 'active', 69, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 71', 'AQ.Ab8RN6IzUHTF35fdFDkQUIph7yNOCCZVQHbjEsE5GH-NizAEvA', 'gemini', 'active', 70, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 72', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 71, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 73', 'AQ.Ab8RN6L9eYBPAJ8UfDFJXJDLUEMNwafw_l6apm58feXvxvBT_w', 'gemini', 'active', 72, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 74', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 73, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 75', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 74, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 76', 'AQ.Ab8RN6LXOhGOgpGsHeGEbKnCWgE-GS-8xZ1ETB4Bq9rDP7yFeA', 'gemini', 'active', 75, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 77', 'AIzaSy_SANITIZED_KEY_PROTECTED', 'gemini', 'active', 76, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 78', 'AQ.Ab8RN6JU06FsE2foC6wNFyK4gWgvtXZm2l8OIIJtA93JvzkhUw', 'gemini', 'active', 77, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 79', 'AQ.Ab8RN6LvdREsmuOyXsRNW1i7RG6WfdK6xQGOiIGZ2056wG9NUg', 'gemini', 'active', 78, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 80', 'AQ.Ab8RN6ILo9lg6zj6sig_u5SKhJSk2uDoZKgA-svqdKTI5_0-yg', 'gemini', 'active', 79, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 81', 'AQ.Ab8RN6LNj_6R756HPzZUMG1CueuDapD9behuWuCjae1QTt4UTA', 'gemini', 'active', 80, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 82', 'AQ.Ab8RN6KWJw5WT1bKLWoQytg3VH3KT8c9Jt0PyC8gnXvAJFAnzQ', 'gemini', 'active', 81, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 83', 'AQ.Ab8RN6LqCWtmWP7FkDPknquFkZzSnTO5eDvjfUAqgE3BB7bZvw', 'gemini', 'active', 82, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 84', 'AQ.Ab8RN6LMhNY2Tzc8s4aY0MVW_otRArjEdoPHu4KG6-8tEm25kA', 'gemini', 'active', 83, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 85', 'AQ.Ab8RN6L10o1TmI9DV3hL5zwyFM2mvzmv3jTuw7Ut_6p-3X1HyA', 'gemini', 'active', 84, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 86', 'AQ.Ab8RN6Jv8NUXl64qoDxLb98aI3swR6L_RUJNe2QkTsXSCgCqNQ', 'gemini', 'active', 85, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 87', 'AQ.Ab8RN6Ko_ux64_RCG3BQ2MkcZ7TLaenUkovVKdJcQ4O7urYNAw', 'gemini', 'active', 86, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 88', 'AQ.Ab8RN6JFKOVwExD8FXAM-4cdJ29HeXmm08iz1AuVLT8nlQNQpg', 'gemini', 'active', 87, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 89', 'AQ.Ab8RN6LDPTXe81HSyw_mKLwJEAC1EhoGF_SLixEtj9Pu7dW4VQ', 'gemini', 'active', 88, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 90', 'AQ.Ab8RN6KefbEEzfiFNKURd7bquqUwDQOxgyLPUi9zoFcrTnRVJg', 'gemini', 'active', 89, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 91', 'AQ.Ab8RN6KUIkRwmI9RYpeMGJ-J8KRc2qAnsjZjjmlYNZ8vCzUHDw', 'gemini', 'active', 90, 0, NOW());
INSERT INTO api_keys (name, key_value, provider, status, order_index, error_count, updated_at)
VALUES ('Gemini Pool Key 92', 'AQ.Ab8RN6L-izkBQ8k03PNA4pOS6shLwJKGjBEQiDkflkeAPEzrxw', 'gemini', 'active', 91, 0, NOW());
