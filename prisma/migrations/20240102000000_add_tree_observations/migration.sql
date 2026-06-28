-- CreateTable
CREATE TABLE "TreeObservation" (
    "id" TEXT NOT NULL,
    "tree_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "audio_url" TEXT,
    "photo_urls" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "reviewer_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreeObservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TreeObservation" ADD CONSTRAINT "TreeObservation_tree_id_fkey" FOREIGN KEY ("tree_id") REFERENCES "Tree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
