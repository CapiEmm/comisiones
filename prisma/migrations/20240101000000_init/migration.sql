-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cliente" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "costo" DECIMAL(12,2) NOT NULL,
    "precio_venta" DECIMAL(12,2) NOT NULL,
    "utilidad" DECIMAL(12,2) NOT NULL,
    "porcentaje_utilidad" DECIMAL(8,4) NOT NULL,
    "factor" DECIMAL(8,4) NOT NULL,
    "comision" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_factors" (
    "id" TEXT NOT NULL,
    "porcentaje" INTEGER NOT NULL,
    "factor" DECIMAL(8,4) NOT NULL,

    CONSTRAINT "commission_factors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "commission_factors_porcentaje_key" ON "commission_factors"("porcentaje");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
