const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un PDF d'ordre de mission pour un trajet
 * @param {Object} trajet - Objet trajet avec toutes les données populées
 * @returns {Promise<Buffer>} - Buffer du PDF généré
 */
const generateOrdreMissionPDF = async (trajet) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // En-tête
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text('ORDRE DE MISSION', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10)
                .font('Helvetica')
                .text(`N° Mission: ${trajet._id.toString().substring(0, 8).toUpperCase()}`, { align: 'center' })
                .text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`, { align: 'center' })
                .moveDown(1);

            // Ligne de séparation
            doc.moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke()
                .moveDown(1);

            // Informations du chauffeur
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('INFORMATIONS CHAUFFEUR', { underline: true })
                .moveDown(0.5);

            doc.fontSize(11)
                .font('Helvetica')
                .text(`Nom complet: ${trajet.chauffeur.prenom} ${trajet.chauffeur.nom}`, { indent: 20 })
                .text(`Email: ${trajet.chauffeur.email}`, { indent: 20 })
                .moveDown(1);

            // Informations du véhicule
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('INFORMATIONS VÉHICULE', { underline: true })
                .moveDown(0.5);

            doc.fontSize(11)
                .font('Helvetica')
                .text(`Camion: ${trajet.camion.marque || ''} ${trajet.camion.modele || ''}`.trim() || 'N/A', { indent: 20 })
                .text(`Matricule: ${trajet.camion.matricule}`, { indent: 20 })
                .text(`Kilométrage: ${trajet.camion.kilometrage || 'N/A'} km`, { indent: 20 })
                .moveDown(0.5);

            // Informations remorque (si disponible)
            if (trajet.remorque && trajet.remorque._id) {
                doc.text(`Remorque: ${trajet.remorque.type || 'N/A'}`, { indent: 20 })
                    .text(`Matricule remorque: ${trajet.remorque.matricule || 'N/A'}`, { indent: 20 });
                if (trajet.remorque.capacite) {
                    doc.text(`Capacité: ${trajet.remorque.capacite} tonnes`, { indent: 20 });
                }
            } else {
                doc.text(`Remorque: Aucune remorque assignée`, { indent: 20 });
            }
            doc.moveDown(1);

            // Informations du trajet
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('DÉTAILS DU TRAJET', { underline: true })
                .moveDown(0.5);

            doc.fontSize(11)
                .font('Helvetica');

            const dateDepart = new Date(trajet.dateDepart);
            const dateArrivee = new Date(trajet.dateArrivee);

            doc.text(`Lieu de départ: ${trajet.lieuDepart}`, { indent: 20 })
                .text(`Date et heure de départ: ${dateDepart.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`, { indent: 20 })
                .moveDown(0.5);

            doc.text(`Lieu d'arrivée: ${trajet.lieuArrivee}`, { indent: 20 })
                .text(`Date et heure d'arrivée prévue: ${dateArrivee.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`, { indent: 20 })
                .moveDown(0.5);

            // Kilométrage et consommation
            if (trajet.kmDepart || trajet.kmArrivee) {
                doc.text(`Kilométrage départ: ${trajet.kmDepart || 'Non renseigné'} km`, { indent: 20 })
                    .text(`Kilométrage arrivée: ${trajet.kmArrivee || 'Non renseigné'} km`, { indent: 20 });

                if (trajet.kmDepart && trajet.kmArrivee) {
                    const distance = trajet.kmArrivee - trajet.kmDepart;
                    doc.text(`Distance parcourue: ${distance} km`, { indent: 20 });
                }
                doc.moveDown(0.5);
            }

            if (trajet.gasoilConsomme) {
                doc.text(`Gasoil consommé: ${trajet.gasoilConsomme} L`, { indent: 20 });
                if (trajet.kmDepart && trajet.kmArrivee) {
                    const distance = trajet.kmArrivee - trajet.kmDepart;
                    if (distance > 0) {
                        const consommation = ((trajet.gasoilConsomme / distance) * 100).toFixed(2);
                        doc.text(`Consommation moyenne: ${consommation} L/100km`, { indent: 20 });
                    }
                }
                doc.moveDown(0.5);
            }

            // Statut
            doc.text(`Statut: ${trajet.statut.toUpperCase()}`, { indent: 20 })
                .moveDown(1);

            // Description et remarques
            if (trajet.description) {
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .text('DESCRIPTION', { underline: true })
                    .moveDown(0.5);

                doc.fontSize(11)
                    .font('Helvetica')
                    .text(trajet.description, { indent: 20, align: 'justify' })
                    .moveDown(1);
            }

            if (trajet.remarques) {
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .text('REMARQUES', { underline: true })
                    .moveDown(0.5);

                doc.fontSize(11)
                    .font('Helvetica')
                    .text(trajet.remarques, { indent: 20, align: 'justify' })
                    .moveDown(1);
            }

            // Ligne de séparation
            doc.moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke()
                .moveDown(1);

            // Pied de page
            doc.fontSize(9)
                .font('Helvetica-Oblique')
                .text('Document généré automatiquement par Truck Fleet Manager', { align: 'center' })
                .text(`Page 1/1`, { align: 'center' });

            // Finaliser le document
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateOrdreMissionPDF
};

