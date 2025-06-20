# ①課題名
APIの動作を比較検証するアプリ（openAI/OCR）

## ②課題内容（どんな作品か）
- openAIのAPIの4タイプ（gpt-3.5-turbo/gpt-4/gpt-4-turbo/gpt-4o）に同時に命令を与えて出力結果を比較する
- OCRのAPIの3サービス（Tesseract.js/Google Cloud Vision/OCR.space）に同時に画像を読み込ませて出力結果を比較する

## ③アプリのデプロイURL
https://masahiko-les.github.io/Kadai05_API/
（keyは消してあるため動きません）

## ④アプリのログイン用IDまたはPassword（ある場合）
なし

## ⑤工夫した点・こだわった点
最初はワインのラベルを写真で撮ってそれを時系列にまとめていくアプリを作ろうとした。
しかしAPIのopenAIやOCRを実装しようとするものの、それぞれのサービスやタイプによってどの程度の性能差があるのかは実際に使ってみないとわからず、実装してみては他を試しとやって開発がなかなか進まなかった。
まずは、開発しやすい環境をつくるために、APIの主要サービスの動作比較ができるアプリをつくるところから始めた。

## ⑥難しかった点・次回トライしたいこと（又は機能）
- APIのサービスによって、keyの取得方法がわかりにくい場合があり、設定に苦労した
- 最初に作りたかったワインのラベル画像からの銘柄読み取りとデータの蓄積ができるアプリを作りたい。検証の結果、Google Cloud Visionを使えばできそうな手ごたえが得られた。
  ⇒作れた！（Google Cloud Vision&OpenAI&FireBaseを活用）

## ⑦フリー項目（感想、シェアしたいこと等なんでも）
- [感想]APIが使えるようになれば、アプリでできることが大きく広がりそうでわくわくしています。
- 参考画像（実際の動作画面）
![Image](https://github.com/user-attachments/assets/f99c97c6-3f03-4732-a9b9-d88deca46979)
![Image](https://github.com/user-attachments/assets/8834772b-9a6e-498e-ab4d-8c3114fcd3cf)
- ワイン認識＆データ蓄積アプリ
![Image](https://github.com/user-attachments/assets/520af6b7-6cb5-4d6b-a77c-4e40c174f95f)
