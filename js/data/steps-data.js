export const STEP_ORDER = ['origin', 'processing', 'export', 'roasting', 'packaging', 'retail']

export const STEP_DATA = {
  origin: {
    title: 'Origin & Harvest',
    summary: 'Harvested and prepared at source.',
    img: './assets/steps/01-origin.png',
    sections: [
      { heading: 'What happens', items: ['Cherries harvested and sorted', 'Defects removed, lots prepared'] },
      { heading: 'Origin', items: ['Los Andes, Huila (CO)', '1650 m · Caturra'] },
      { heading: 'Status', items: ['Sorting completed', 'Ready for processing'] }
    ]
  },
  processing: {
    title: 'Processing',
    summary: 'Processed and dried before export.',
    img: './assets/steps/02-processing.png',
    sections: [
      { heading: 'What happens', items: ['Washed processing applied', 'Controlled drying and grading'] },
      { heading: 'Key specs', items: ['Washed · 18h ferment', '12d patio · 10.5–11.5%'] },
      { heading: 'Status', items: ['Drying completed', 'Ready for export'] }
    ]
  },
  export: {
    title: 'Export & Logistics',
    summary: 'Packed and shipped to destination.',
    img: './assets/steps/03-export.png',
    sections: [
      { heading: 'What happens', items: ['Bags labeled and documented', 'Container loaded and shipped'] },
      { heading: 'Shipment', items: ['FOB · 20ft container', 'Buenaventura → Port Klang'] },
      { heading: 'Status', items: ['Docs completed', 'In transit'] }
    ]
  },
  roasting: {
    title: 'Roasting',
    summary: 'Roasted with QC checkpoints.',
    img: './assets/steps/04-roasting.png',
    sections: [
      { heading: 'What happens', items: ['Profile executed and cooled', 'QC and cupping performed'] },
      { heading: 'Roast', items: ['Medium · 198°C', 'Dev 1:35 · 60 kg'] },
      { heading: 'Status', items: ['QC passed', 'Ready for packaging'] }
    ]
  },
  packaging: {
    title: 'Packaging',
    summary: 'Packed for retail distribution.',
    img: './assets/steps/05-packaging.png',
    sections: [
      { heading: 'What happens', items: ['Packed and sealed', 'Labels and QR applied'] },
      { heading: 'Pack', items: ['250 g · One-way valve', 'SKU CPF-250-MED'] },
      { heading: 'Status', items: ['Checks completed', 'Ready for retail'] }
    ]
  },
  retail: {
    title: 'Retail & Brew',
    summary: 'Served and brewed for customers.',
    img: './assets/steps/06-retail.png',
    sections: [
      { heading: 'What happens', items: ['Stock received and stored', 'Coffee brewed to recipe'] },
      { heading: 'Brew', items: ['Espresso · 18g in', '36g out · 28–32s'] },
      { heading: 'Status', items: ['In service', 'Monitoring issues'] }
    ]
  }
}