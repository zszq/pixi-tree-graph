import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { BitmapText } from '@pixi/text-bitmap';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { textToPixi } from '../utils/text';
import { TextureCache } from '../texture-cache';
import { getObjValues } from '../utils/tools'
import { TextType, TextStyle } from '../utils/text'
import { Graphics } from '@pixi/graphics';

export interface contentStyle extends TextStyle {
  content: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
}
export interface contentLabelStyle extends TextStyle {
  content: string;
  padding: number;
  backgroundColor: string;
  borderColor: string;
}

const DELIMITER = '::';
const WHITE = 0xffffff;
const AMOUNT_TEXT = 'AMOUNT_TEXT';
const ADDRESS_TEXT = 'ADDRESS_TEXT';
const LABEL_TEXT = 'LABEL_TEXT';
const LABEL_TEXT_BACKGROUND = 'LABEL_TEXT_BACKGROUND';
const AMOUNT_ICON = 'AMOUNT_ICON';
const ADDRESS_ICON = 'ADDRESS_ICON';
const NODE_BORDER = 'NODE_BORDER';
const NODE_BACKGROUND = 'NODE_BACKGROUND';

export function createNodeContent(nodeContentGfx: Container, nodeStyle: NodeStyle) {
  // nodeContentGfx -> nodeBorder
  const nodeBorder = new Sprite();
  nodeBorder.name = NODE_BORDER;
  nodeBorder.anchor.set(0.5);
  nodeContentGfx.addChild(nodeBorder);
  // nodeContentGfx -> nodeBackground
  const nodeBackground = new Sprite();
  nodeBackground.name = NODE_BACKGROUND;
  nodeBackground.anchor.set(0.5);
  nodeContentGfx.addChild(nodeBackground);

  // amount
  const nodeAmountText = new Sprite();
  nodeAmountText.name = AMOUNT_TEXT;
  nodeAmountText.anchor.set(0.5);
  nodeContentGfx.addChild(nodeAmountText);

  // address
  const nodeAddressText = new Sprite();
  nodeAddressText.name = ADDRESS_TEXT;
  nodeAddressText.anchor.set(0.5);
  nodeContentGfx.addChild(nodeAddressText);

  if (nodeStyle.content.label.show) {
    // labelBackground
    const nodeLabelBackground = new Sprite(Texture.WHITE);
    nodeLabelBackground.name = LABEL_TEXT_BACKGROUND;
    nodeLabelBackground.anchor.set(0.5);
    nodeContentGfx.addChild(nodeLabelBackground);
    // labelText
    const nodeLabelText = new Sprite();
    nodeLabelText.name = LABEL_TEXT;
    nodeLabelText.anchor.set(0.5);
    nodeContentGfx.addChild(nodeLabelText);
  }

  // amountIcon
  const amountIcon = new Sprite();
  amountIcon.name = AMOUNT_ICON;
  amountIcon.anchor.set(0.5);
  nodeContentGfx.addChild(amountIcon);

  // addressIcon
  const addressIcon = new Sprite();
  addressIcon.name = ADDRESS_ICON;
  addressIcon.anchor.set(0.5);
  nodeContentGfx.addChild(addressIcon);

}

export function updateNodeContentStyle(nodeContentGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
  const amountStyle: contentStyle = nodeStyle.content.amount;
  const addressStyle: contentStyle = nodeStyle.content.address;
  const labelStyle: contentLabelStyle = nodeStyle.content.label;
  const nodeWidth = nodeStyle.width;
  const nodeHeight = nodeStyle.height;
  const nodePadding = nodeStyle.padding;
  const iconRight = 8; // ??????????????????????????????

  // amountIcon
  const amountIocnTextureKey = [AMOUNT_ICON, amountStyle.icon].join(DELIMITER);
  const amountIconTexture: Texture = getIconTexture(textureCache, amountIocnTextureKey, amountStyle.icon);
  const amountIcon = nodeContentGfx.getChildByName!(AMOUNT_ICON) as Sprite;
  amountIcon.texture = amountIconTexture;
  // console.log('?????????????????????????????????', amountIconTexture.width, amountIconTexture.height);
  amountIcon.x = -nodeWidth / 2 + amountStyle.iconWidth / 2 + nodePadding;
  amountIcon.y = -(nodeHeight / 2) + amountStyle.iconHeight / 2 + nodePadding;
  // amount
  const amountTextTextureKey = [AMOUNT_TEXT, ...getObjValues(amountStyle)].join(DELIMITER);
  const amountTextTexture = getTextTexture(amountTextTextureKey, textureCache, amountStyle);
  // set amount texture
  const amountText = nodeContentGfx.getChildByName!(AMOUNT_TEXT) as Sprite;
  amountText.texture = amountTextTexture;
  amountText.x = -nodeWidth / 2 + nodePadding + amountStyle.iconWidth + amountTextTexture.width / 2 + iconRight;
  amountText.y = amountIcon.y;

  // addressIcon
  const addressIconTextureKey = [ADDRESS_ICON, addressStyle.icon].join(DELIMITER);
  const addressIconTexture: Texture = getIconTexture(textureCache, addressIconTextureKey, addressStyle.icon);
  const addressIcon = nodeContentGfx.getChildByName!(ADDRESS_ICON) as Sprite;
  addressIcon.texture = addressIconTexture;
  addressIcon.x = -nodeWidth / 2 + addressStyle.iconWidth / 2 + nodePadding;
  // address
  const addressTextTextureKey = [ADDRESS_TEXT, ...getObjValues(addressStyle)].join(DELIMITER);
  const addressTextTexture = getTextTexture(addressTextTextureKey, textureCache, addressStyle);
  // set address texture
  const addressText = nodeContentGfx.getChildByName!(ADDRESS_TEXT) as Sprite;
  addressText.texture = addressTextTexture;
  addressText.x = -nodeWidth / 2 + nodePadding + addressStyle.iconWidth + addressTextTexture.width / 2 + iconRight;

  // label
  if (nodeStyle.content.label.show) {
    // labelText
    const labelTextTextureKey = [LABEL_TEXT, ...getObjValues(labelStyle, [])].join(DELIMITER);
    const labelTextTexture = getTextTexture(labelTextTextureKey, textureCache, labelStyle);
    // set labelText
    const labelText = nodeContentGfx.getChildByName!(LABEL_TEXT) as Sprite;
    labelText.texture = labelTextTexture;
    const labelX = -(nodeWidth / 2) + labelTextTexture.width / 2 + labelStyle.padding + nodePadding;
    const labelY = nodeHeight / 3 - labelStyle.padding;
    labelText.position.set(labelX, labelY);
    // // set labelBackground
    const nodeLabelBackground = nodeContentGfx.getChildByName!(LABEL_TEXT_BACKGROUND) as Sprite;
    nodeLabelBackground.width = labelTextTexture.width + labelStyle.padding * 2 + 2; // TODO:??????padding?????????
    nodeLabelBackground.height = labelTextTexture.height + labelStyle.padding * 2;
    nodeLabelBackground.position.set(labelX, labelY);
    [nodeLabelBackground.tint, nodeLabelBackground.alpha] = colorToPixi(labelStyle.backgroundColor);
  }

  // nodeBackground
  const nodeCircleTextureKey = [NODE_BACKGROUND, nodeStyle.radius].join(DELIMITER);
  const nodeCircleTexture = textureCache.get(nodeCircleTextureKey, () => {
    const graphics = new Graphics();
    graphics.beginFill(WHITE);
    if (nodeStyle.shape === 'circle') {
      graphics.drawCircle(0, 0, nodeStyle.radius);
    }
    if (nodeStyle.shape === 'rect') {
      graphics.drawRoundedRect(0, 0, nodeStyle.width, nodeStyle.height, nodeStyle.radius);
    }
    return graphics;
  });
  // nodeContentGfx -> nodeBackground
  const nodeCircle = nodeContentGfx.getChildByName!(NODE_BACKGROUND) as Sprite;
  nodeCircle.texture = nodeCircleTexture;
  [nodeCircle.tint, nodeCircle.alpha] = colorToPixi(nodeStyle.color);

  // nodeBorder
  const nodeCircleBorderTextureKey = [NODE_BORDER, nodeStyle.radius, nodeStyle.border.width].join(DELIMITER);
  const nodeCircleBorderTexture = textureCache.get(nodeCircleBorderTextureKey, () => {
    const graphics = new Graphics();
    graphics.beginFill(WHITE);
    if (nodeStyle.shape === 'circle') {
      graphics.drawCircle(0, 0, (nodeStyle.radius + nodeStyle.border.width));
    }
    if (nodeStyle.shape === 'rect') {
      graphics.drawRoundedRect(0, 0, nodeStyle.width + nodeStyle.border.width, nodeStyle.height + nodeStyle.border.width, nodeStyle.radius);
    }
    return graphics;
  });
  // nodeContentGfx -> nodeBorder
  const nodeCircleBorder = nodeContentGfx.getChildByName!(NODE_BORDER) as Sprite;
  nodeCircleBorder.texture = nodeCircleBorderTexture;
  [nodeCircleBorder.tint, nodeCircleBorder.alpha] = colorToPixi(nodeStyle.border.color);
}



export function updateNodeContentVisibility(nodeContentGfx: Container, zoomStep: number) {
  const nodeAmountText = nodeContentGfx.getChildByName!(AMOUNT_TEXT) as Sprite;
  nodeAmountText.renderable = nodeAmountText.renderable && zoomStep >= 2;
  const nodeAmountIcon = nodeContentGfx.getChildByName!(AMOUNT_ICON) as Sprite;
  nodeAmountIcon.renderable = nodeAmountIcon.renderable && zoomStep >= 2;

  const nodeAddressText = nodeContentGfx.getChildByName!(ADDRESS_TEXT) as Sprite;
  nodeAddressText.renderable = nodeAddressText.renderable && zoomStep >= 2;
  const nodeAddressIcon = nodeContentGfx.getChildByName!(ADDRESS_ICON) as Sprite;
  nodeAddressIcon.renderable = nodeAddressIcon.renderable && zoomStep >= 2;

  const nodeLabelText = nodeContentGfx.getChildByName!(LABEL_TEXT) as Sprite;
  if (nodeLabelText) {
    nodeLabelText.renderable = nodeLabelText.renderable && zoomStep >= 2;
    const nodeLabelBackground = nodeContentGfx.getChildByName!(LABEL_TEXT_BACKGROUND) as Sprite;
    nodeLabelBackground.renderable = nodeLabelBackground.renderable && zoomStep >= 2;
  }

  const nodeCircleBorder = nodeContentGfx.getChildByName!(NODE_BORDER) as Sprite;
  nodeCircleBorder.renderable = nodeCircleBorder.renderable && zoomStep >= 1;
}



function getTextTexture(textureKey: string, textureCache: TextureCache, cententOrStyle: any) {
  const textTexture = textureCache.get(textureKey, () => {
    const text = textToPixi(TextType.TEXT, cententOrStyle.content as string, {
      fontFamily: cententOrStyle.fontFamily,
      fontSize: cententOrStyle.fontSize,
      fontWeight: cententOrStyle.fontWeight,
      color: cententOrStyle.color,
      stroke: cententOrStyle.stroke,
      strokeThickness: cententOrStyle.strokeThickness
    });
    return text;
  });

  return textTexture;
}

function getIconTexture(textureCache: TextureCache, iocnTextureKey: string, iconUrl: string) {
  let iconTexture: Texture;
  if (textureCache.has(iocnTextureKey)) {
    iconTexture = textureCache.getOnly(iocnTextureKey)!;
  } else {
    iconTexture = Texture.from(iconUrl);
    textureCache.set(iocnTextureKey, iconTexture);
  }
  return iconTexture;
}
