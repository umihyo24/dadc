# Demon Army Dispatch Center 実装レポート

## 変更内容:
- 個別モンスター人員に `specializationTags` と `experienceRecords` を追加し、同じ種族でも戦歴に応じた専門化を持てるようにしました。
- 戦闘中に敵勢力別キル、弓兵キル、装甲敵キル、前衛配置、生還、MVP を記録し、戦闘後に専門化タグを判定するようにしました。
- 専門化タグごとに日当上昇を加算し、派遣準備画面・会社画面・人員カードで基礎日当、ベテラン割増、最終日当を表示するようにしました。
- 準備画面に `Specialist Premium` と「Veteran premium is reducing projected profit.」警告を追加し、高額ベテランの投入が利益を削ることを明示しました。
- 結果画面に新規専門化、日当変化、MVP 回数変化、ベテラン信用ボーナスを表示する欄を追加しました。
- 専門化効果は条件付き効果だけに限定し、レベル、汎用攻撃上昇、汎用HP上昇、スキルツリー、手動ポイント配分は追加していません。

## 理由:
- 「強い個体を育てる楽しさ」は残しつつ、「その個体を毎回使えばよい」という単純なRPG型最適解を避けるためです。
- 専門化を敵種別・配置・生還・MVP履歴に結びつけることで、「この契約には誰が本当に合うか」を契約ごとに考えさせるためです。
- 専門化が増えるほど日当が増えるため、名のあるベテランは強力だが利益を圧迫する経営リスクになるようにしました。

## 追加した専門化成長:
- `humanHunter` / 人間狩り
  - 条件: `humanKills >= 10`
  - 効果: Human 勢力への与ダメージ +10%
  - 日当: +8G
- `undeadSpecialist` / 不死者専門
  - 条件: `undeadKills >= 10`
  - 効果: Undead 勢力への与ダメージ +10%
  - 日当: +8G
- `archerBreaker` / 弓兵崩し
  - 条件: `archerKills >= 6`
  - 効果: 弓兵への与ダメージ +12%
  - 日当: +7G
- `fortressBreaker` / 城塞崩し
  - 条件: `armoredKills >= 6`
  - 効果: 装甲2以上の敵への与ダメージ +10%
  - 日当: +9G
- `frontlineVeteran` / 前線古参
  - 条件: `frontlineDeployments >= 10`
  - 効果: 前衛配置中だけ被ダメージ -8%
  - 日当: +6G
- `survivor` / 生還者
  - 条件: `battlesSurvived >= 8`
  - 効果: 生還時の負傷判定HPしきい値 -25%
  - 日当: +5G
- `mvpRegular` / 常連MVP
  - 条件: `mvpCount >= 3`
  - 効果: 生還時に信用 +4
  - 日当: +10G

## 日当上昇の仕組み:
- 最終日当は以下で計算します。

```text
finalWage = speciesBaseWage + sum(specialization.wageIncrease)
```

- 例: 基礎日当20Gのオークが `humanHunter` と `survivor` を持つ場合、20G + 8G + 5G = 33G になります。
- 契約中に新しいタグを獲得した場合、その契約の人件費は派遣時点の日当に基づき、次回以降の派遣から上昇後の日当が反映されます。
- ハードなタグ上限は設けず、`CONFIG.personnel.maxSpecializationTags = null` としました。多芸な個体は自然に高額化します。

## 契約判断への影響:
- 安い商業契約では、専門化を複数持つベテランを入れると `Projected Profit` が下がり、赤字化する可能性があります。
- 人間系の敵が多い契約では `人間狩り`、弓兵が多い契約では `弓兵崩し`、重装敵が多い契約では `城塞崩し` が価値を持ちます。
- 名誉契約では赤字を許容して `常連MVP` などのベテランを使い、信用獲得を優先する判断ができます。
- 前衛で酷使した古参は前衛時だけ硬くなりますが、割増日当が増えるため「利益を守るなら若手を出す」という判断が残ります。

## 追加・変更したCONFIG:
- `CONFIG.personnel.maxSpecializationTags = null`
- `CONFIG.specializations.humanHunter`
- `CONFIG.specializations.undeadSpecialist`
- `CONFIG.specializations.archerBreaker`
- `CONFIG.specializations.fortressBreaker`
- `CONFIG.specializations.frontlineVeteran`
- `CONFIG.specializations.survivor`
- `CONFIG.specializations.mvpRegular`
- 各専門化には `label`, `condition`, `threshold`, `wageIncrease`, `bonusType` と、対象・倍率・信用ボーナスなどの調整値を持たせています。

## 現在のコアループ:
1. 契約選択画面で報酬、敵編成、人件費予算、信用報酬、ボーナス条件を読む。
2. 準備画面で候補者の基礎日当、ベテラン割増、最終日当、専門化タグ、疲労・負傷を確認する。
3. 敵に合った専門家を投入するか、安い人員で利益を守るかを判断する。
4. 前衛・後衛に配置し、総人件費、専門化割増、契約予算、予測利益を見る。
5. 自動戦闘でキル対象、配置、生還、MVPが履歴として蓄積される。
6. 結果画面で利益、信用、損耗、新規専門化、日当変化、MVP変化を確認する。
7. 次の契約では、育ったベテランの条件付き強みと高額化した日当を比較して再配置を考える。

## 既知の制限:
- 現在の敵編成は Human が中心のため、`不死者専門` は将来の Undead 敵追加に備えたタグです。
- 専門化タグの説明はカード上では短縮表示で、詳細なツールチップ画面は未実装です。
- 勝率予測は専門化の細かな相性を完全シミュレーションしていない簡易予測です。
- タグ数上限は未使用ですが、将来のバランス調整用に CONFIG として用意しています。
